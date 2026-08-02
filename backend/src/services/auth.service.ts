import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { executeQuery, executeQueryOne, executeUpdate, withTransaction } from '../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { CreateUserDto, User, UserWithRoles, UserRole } from '../models/types';
import { notificationService } from './notification.service';
import { logger } from '../utils/logger';
import { getSupabaseAdmin, getSupabaseAnon, isSupabaseAuthEnabled } from '../config/supabase';

const SALT_ROUNDS = 12;

type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: Omit<UserWithRoles, 'password_hash'>;
};

export class AuthService {
  async register(dto: CreateUserDto): Promise<AuthResult> {
    if (isSupabaseAuthEnabled()) {
      return this.registerWithSupabase(dto);
    }
    return this.registerLegacy(dto);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    if (isSupabaseAuthEnabled()) {
      return this.loginWithSupabase(email, password);
    }
    return this.loginLegacy(email, password);
  }

  // ─── Supabase Auth ──────────────────────────────────────────────────────────

  private async registerWithSupabase(dto: CreateUserDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();
    const existing = await executeQueryOne<User>('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const admin = getSupabaseAdmin();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        first_name: dto.first_name.trim(),
        last_name: dto.last_name.trim(),
        phone: dto.phone || null,
      },
    });

    if (createError || !created.user) {
      logger.error('[Auth] Supabase createUser failed:', createError);
      throw new AppError(createError?.message || 'Failed to create account.', 400);
    }

    let userId: number;
    try {
      userId = await withTransaction(async (conn) => {
        const [userResult] = await conn.execute(
          `INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, token_version, auth_uid, authentication_method, email_verified, last_login)
           VALUES (?, NULL, ?, ?, ?, ?, 0, ?, 'Email Password', TRUE, NOW())`,
          [
            email,
            dto.first_name.trim(),
            dto.last_name.trim(),
            dto.phone || null,
            dto.date_of_birth || null,
            created.user!.id,
          ]
        ) as any;

        const id = userResult.insertId as number;
        await conn.execute(`INSERT INTO user_roles (user_id, role) VALUES (?, 'customer')`, [id]);
        return id;
      });
    } catch (err) {
      // Roll back auth user if local profile insert fails
      await admin.auth.admin.deleteUser(created.user.id);
      throw err;
    }

    const session = await this.signInSupabase(email, dto.password);
    const user = await this.findUserWithRoles(userId);
    if (!user) throw new AppError('Failed to create account.', 500);

    notificationService.sendWelcomeEmail({ email: user.email, first_name: user.first_name });
    const { password_hash, ...safeUser } = user;
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: safeUser,
    };
  }

  private async loginWithSupabase(email: string, password: string): Promise<AuthResult> {
    const normalized = email.toLowerCase().trim();
    let session;
    try {
      session = await this.signInSupabase(normalized, password);
    } catch (err) {
      // Migrate legacy bcrypt users into Supabase Auth on first successful local login
      const migrated = await this.migrateLegacyUserToSupabase(normalized, password);
      if (!migrated) throw err;
      session = await this.signInSupabase(normalized, password);
    }

    let user = await this.findUserWithRoles(undefined, undefined, session.user.id);
    if (!user) {
      user = await this.findUserWithRoles(undefined, normalized);
      if (user && !user.auth_uid) {
        await executeUpdate('UPDATE users SET auth_uid = ?, last_login = NOW() WHERE id = ?', [
          session.user.id,
          user.id,
        ]);
        user = await this.findUserWithRoles(user.id);
      }
    }

    if (!user) {
      throw new AppError('Account profile not found. Please register again.', 404);
    }
    if (!user.is_active) {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    await executeUpdate('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    logger.info(`[Auth] Supabase login: ${user.email} (ID: ${user.id})`);

    const { password_hash, ...safeUser } = user;
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: safeUser,
    };
  }

  private async signInSupabase(email: string, password: string) {
    const anon = getSupabaseAnon();
    const { data, error } = await anon.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      throw new AppError('Invalid email or password.', 401);
    }
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    };
  }

  private async migrateLegacyUserToSupabase(email: string, password: string): Promise<boolean> {
    const user = await executeQueryOne<User>('SELECT * FROM users WHERE email = ?', [email]);
    if (!user?.password_hash) return false;

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return false;

    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });

    if (error || !data.user) {
      // Already exists in Auth — try linking by email lookup
      const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const match = listed.data.users.find((u) => u.email?.toLowerCase() === email);
      if (!match) {
        logger.error('[Auth] Legacy migration failed:', error);
        return false;
      }
      await executeUpdate('UPDATE users SET auth_uid = ? WHERE id = ?', [match.id, user.id]);
      return true;
    }

    await executeUpdate('UPDATE users SET auth_uid = ? WHERE id = ?', [data.user.id, user.id]);
    logger.info(`[Auth] Migrated legacy user ${email} to Supabase Auth`);
    return true;
  }

  // ─── Legacy local JWT auth ──────────────────────────────────────────────────

  private async registerLegacy(dto: CreateUserDto): Promise<AuthResult> {
    const existing = await executeQueryOne<User>(
      'SELECT id FROM users WHERE email = ?',
      [dto.email.toLowerCase().trim()]
    );
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    let userId: number;

    await withTransaction(async (conn) => {
      const [userResult] = await conn.execute(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, token_version)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [
          dto.email.toLowerCase().trim(),
          passwordHash,
          dto.first_name.trim(),
          dto.last_name.trim(),
          dto.phone || null,
          dto.date_of_birth || null,
        ]
      ) as any;

      userId = userResult.insertId;
      await conn.execute(`INSERT INTO user_roles (user_id, role) VALUES (?, 'customer')`, [userId!]);
      await conn.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [userId!]);
    });

    const user = await this.findUserWithRoles(userId!);
    if (!user) throw new AppError('Failed to create account.', 500);

    const tokens = this.generateTokens(user);
    notificationService.sendWelcomeEmail({ email: user.email, first_name: user.first_name });
    const { password_hash, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  }

  private async loginLegacy(email: string, password: string): Promise<AuthResult> {
    const user = await this.findUserWithRoles(undefined, email.toLowerCase().trim());

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }
    if (!user.is_active) {
      throw new AppError('Your account has been suspended. Please contact support.', 403);
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const tokens = this.generateTokens(user);
    logger.info(`[Auth] User logged in: ${user.email} (ID: ${user.id})`);
    await executeUpdate('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const { password_hash, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  }

  // ─── Google OAuth (legacy tokens for now) ───────────────────────────────────

  private async getOAuthClient(): Promise<OAuth2Client> {
    const keys = ['google_oauth_client_id', 'google_oauth_client_secret', 'google_oauth_redirect_urls'];
    const placeholders = keys.map(() => '?').join(',');
    const rows = await executeQuery<{ setting_key: string; setting_value: any }>(
      `SELECT setting_key, setting_value FROM business_settings WHERE setting_key IN (${placeholders})`,
      keys
    );

    const settings: Record<string, string> = {};
    for (const row of rows) {
      const raw = row.setting_value;
      settings[row.setting_key] =
        typeof raw === 'string' ? JSON.parse(raw) : (raw ?? '');
    }

    const clientId = settings['google_oauth_client_id'] || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = settings['google_oauth_client_secret'] || process.env.GOOGLE_CLIENT_SECRET;
    const redirectUrl =
      settings['google_oauth_redirect_urls'] ||
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3000/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      throw new AppError('Google OAuth is not properly configured on the server.', 500);
    }

    return new OAuth2Client(clientId, clientSecret, redirectUrl);
  }

  async getGoogleAuthUrl(action: string = 'login'): Promise<string> {
    const client = await this.getOAuthClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'consent',
      state: action,
    });
  }

  async handleGoogleCallback(code: string, action: string = 'login'): Promise<AuthResult> {
    const client = await this.getOAuthClient();

    let tokens;
    try {
      const { tokens: t } = await client.getToken(code);
      tokens = t;
    } catch (error) {
      logger.error('Google token exchange failed:', error);
      throw new AppError('Invalid Google authorization code.', 401);
    }

    if (!tokens.id_token) {
      throw new AppError('Google did not return an ID token.', 401);
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({ idToken: tokens.id_token });
      payload = ticket.getPayload();
    } catch (error) {
      logger.error('Google token verification failed:', error);
      throw new AppError('Invalid Google token.', 401);
    }

    if (!payload || !payload.email) {
      throw new AppError('Google authentication data is incomplete.', 400);
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const firstName = payload.given_name || 'User';
    const lastName = payload.family_name || '';
    const picture = payload.picture || null;

    let user = await executeQueryOne<User & { auth_uid?: string }>(
      'SELECT * FROM users WHERE google_id = ? OR email = ?',
      [googleId, email]
    );

    if (!user) {
      if (action !== 'register') {
        throw new AppError('No account found. Please register first.', 404, 'ACCOUNT_NOT_FOUND');
      }

      const passwordHash = await bcrypt.hash(uuidv4(), SALT_ROUNDS);
      let authUid: string | null = null;

      if (isSupabaseAuthEnabled()) {
        const admin = getSupabaseAdmin();
        const { data, error } = await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { first_name: firstName, last_name: lastName, google_id: googleId },
        });
        if (!error && data.user) authUid = data.user.id;
      }

      const insertId = await withTransaction(async (conn) => {
        const [res] = await conn.execute(
          `INSERT INTO users (email, password_hash, first_name, last_name, google_id, profile_photo_url, authentication_method, auth_uid, last_login)
           VALUES (?, ?, ?, ?, ?, ?, 'Google OAuth', ?, NOW())`,
          [email, passwordHash, firstName, lastName, googleId, picture, authUid]
        ) as any;
        await conn.execute(`INSERT INTO user_roles (user_id, role) VALUES (?, 'customer')`, [res.insertId]);
        return res.insertId as number;
      });

      user = await executeQueryOne<User>('SELECT * FROM users WHERE id = ?', [insertId]) as User;
    } else {
      await executeUpdate(
        `UPDATE users SET google_id = COALESCE(google_id, ?), profile_photo_url = COALESCE(profile_photo_url, ?), authentication_method = 'Google OAuth', last_login = NOW() WHERE id = ?`,
        [googleId, picture, user.id]
      );
    }

    const userWithRoles = await this.findUserWithRoles(user.id);
    if (!userWithRoles) throw new AppError('Account error.', 500);

    // Google still returns app JWTs; middleware accepts both
    const authTokens = this.generateTokens(userWithRoles);
    const { password_hash, ...safeUser } = userWithRoles;
    return { ...authTokens, user: safeUser };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (isSupabaseAuthEnabled()) {
      const anon = getSupabaseAnon();
      const { data, error } = await anon.auth.refreshSession({ refresh_token: refreshToken });
      if (!error && data.session) {
        return {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        };
      }
      // Fall through — cookie may still hold a legacy refresh JWT
    }

    let payload: any;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    const user = await executeQueryOne<User>('SELECT * FROM users WHERE id = ?', [payload.userId]);
    if (!user || user.token_version !== payload.tokenVersion) {
      throw new AppError('Session invalidated. Please log in again.', 401);
    }

    const userWithRoles = await this.findUserWithRoles(user.id);
    if (!userWithRoles) throw new AppError('Account error.', 500);
    return this.generateTokens(userWithRoles);
  }

  async logout(userId: number): Promise<void> {
    await executeUpdate('UPDATE users SET token_version = token_version + 1 WHERE id = ?', [userId]);

    if (isSupabaseAuthEnabled()) {
      const row = await executeQueryOne<{ auth_uid: string | null }>('SELECT auth_uid FROM users WHERE id = ?', [
        userId,
      ]);
      if (row?.auth_uid) {
        try {
          await getSupabaseAdmin().auth.admin.signOut(row.auth_uid);
        } catch (err) {
          logger.warn('[Auth] Supabase signOut failed:', err);
        }
      }
    }

    logger.info(`[Auth] User logged out: ID ${userId}`);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await executeQueryOne<User & { auth_uid?: string | null }>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    if (!user) throw new AppError('User not found.', 404);

    if (isSupabaseAuthEnabled() && user.auth_uid) {
      // Verify current password via sign-in
      try {
        await this.signInSupabase(user.email, currentPassword);
      } catch {
        throw new AppError('Current password is incorrect.', 400);
      }

      const { error } = await getSupabaseAdmin().auth.admin.updateUserById(user.auth_uid, {
        password: newPassword,
      });
      if (error) throw new AppError(error.message, 400);

      await executeUpdate('UPDATE users SET token_version = token_version + 1 WHERE id = ?', [userId]);
      return;
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) throw new AppError('Current password is incorrect.', 400);

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await executeUpdate(
      'UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?',
      [newHash, userId]
    );
  }

  private async findUserWithRoles(
    userId?: number,
    email?: string,
    authUid?: string
  ): Promise<(UserWithRoles & { auth_uid?: string | null }) | null> {
    let whereClause = 'u.id = ?';
    let param: string | number | undefined = userId;

    if (authUid) {
      whereClause = 'u.auth_uid = ?';
      param = authUid;
    } else if (email) {
      whereClause = 'u.email = ?';
      param = email;
    }

    const rows = await executeQuery<User & { role: UserRole; auth_uid?: string | null }>(
      `SELECT u.*, ur.role
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       WHERE ${whereClause}`,
      [param]
    );

    if (!rows.length) return null;

    const base = rows[0];
    return {
      id: base.id,
      email: base.email,
      password_hash: base.password_hash,
      first_name: base.first_name,
      last_name: base.last_name,
      phone: base.phone,
      date_of_birth: base.date_of_birth,
      profile_photo_url: base.profile_photo_url,
      google_id: base.google_id,
      token_version: base.token_version,
      is_active: base.is_active,
      email_verified: base.email_verified,
      created_at: base.created_at,
      updated_at: base.updated_at,
      auth_uid: base.auth_uid,
      roles: rows.map((r) => r.role).filter(Boolean),
    };
  }

  private generateTokens(user: UserWithRoles): { accessToken: string; refreshToken: string } {
    return {
      accessToken: signAccessToken({
        userId: user.id,
        email: user.email,
        roles: user.roles,
      }),
      refreshToken: signRefreshToken({
        userId: user.id,
        tokenVersion: user.token_version,
      }),
    };
  }
}

export const authService = new AuthService();
