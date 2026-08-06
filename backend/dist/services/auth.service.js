"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const google_auth_library_1 = require("google-auth-library");
const database_1 = require("../config/database");
const jwt_1 = require("../utils/jwt");
const error_middleware_1 = require("../middleware/error.middleware");
const notification_service_1 = require("./notification.service");
const logger_1 = require("../utils/logger");
const supabase_1 = require("../config/supabase");
const SALT_ROUNDS = 12;
class AuthService {
    async register(dto) {
        if ((0, supabase_1.isSupabaseAuthEnabled)()) {
            return this.registerWithSupabase(dto);
        }
        return this.registerLegacy(dto);
    }
    async login(email, password) {
        // ── Development shortcut: match plain-text .env credentials first ──────
        if (process.env.NODE_ENV === 'development') {
            const devResult = await this.tryDevLogin(email, password);
            if (devResult)
                return devResult;
        }
        // ── End development shortcut ──────────────────────────────────────────
        if ((0, supabase_1.isSupabaseAuthEnabled)()) {
            return this.loginWithSupabase(email, password);
        }
        return this.loginLegacy(email, password);
    }
    // ─── Supabase Auth ──────────────────────────────────────────────────────────
    async registerWithSupabase(dto) {
        const email = dto.email.toLowerCase().trim();
        const existing = await (0, database_1.executeQueryOne)('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            throw new error_middleware_1.AppError('An account with this email address already exists.', 409);
        }
        const admin = (0, supabase_1.getSupabaseAdmin)();
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
            logger_1.logger.error('[Auth] Supabase createUser failed:', createError);
            throw new error_middleware_1.AppError(createError?.message || 'Failed to create account.', 400);
        }
        let userId;
        try {
            userId = await (0, database_1.withTransaction)(async (conn) => {
                const [userResult] = await conn.execute(`INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, token_version, auth_uid, authentication_method, email_verified, last_login)
           VALUES (?, NULL, ?, ?, ?, ?, 0, ?, 'Email Password', TRUE, NOW())`, [
                    email,
                    dto.first_name.trim(),
                    dto.last_name.trim(),
                    dto.phone || null,
                    dto.date_of_birth || null,
                    created.user.id,
                ]);
                const id = userResult.insertId;
                await conn.execute(`INSERT INTO user_roles (user_id, role) VALUES (?, 'customer')`, [id]);
                return id;
            });
        }
        catch (err) {
            // Roll back auth user if local profile insert fails
            await admin.auth.admin.deleteUser(created.user.id);
            throw err;
        }
        const session = await this.signInSupabase(email, dto.password);
        const user = await this.findUserWithRoles(userId);
        if (!user)
            throw new error_middleware_1.AppError('Failed to create account.', 500);
        notification_service_1.notificationService.sendWelcomeEmail({ email: user.email, first_name: user.first_name });
        const { password_hash, ...safeUser } = user;
        return {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            user: safeUser,
        };
    }
    async loginWithSupabase(email, password) {
        const normalized = email.toLowerCase().trim();
        let session;
        try {
            session = await this.signInSupabase(normalized, password);
        }
        catch (err) {
            // Migrate legacy bcrypt users into Supabase Auth on first successful local login
            const migrated = await this.migrateLegacyUserToSupabase(normalized, password);
            if (!migrated)
                throw err;
            session = await this.signInSupabase(normalized, password);
        }
        let user = await this.findUserWithRoles(undefined, undefined, session.user.id);
        if (!user) {
            user = await this.findUserWithRoles(undefined, normalized);
            if (user && !user.auth_uid) {
                await (0, database_1.executeUpdate)('UPDATE users SET auth_uid = ?, last_login = NOW() WHERE id = ?', [
                    session.user.id,
                    user.id,
                ]);
                user = await this.findUserWithRoles(user.id);
            }
        }
        if (!user) {
            throw new error_middleware_1.AppError('Account profile not found. Please register again.', 404);
        }
        if (!user.is_active) {
            throw new error_middleware_1.AppError('Your account has been suspended. Please contact support.', 403);
        }
        await (0, database_1.executeUpdate)('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        logger_1.logger.info(`[Auth] Supabase login: ${user.email} (ID: ${user.id})`);
        const { password_hash, ...safeUser } = user;
        return {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            user: safeUser,
        };
    }
    async signInSupabase(email, password) {
        const anon = (0, supabase_1.getSupabaseAnon)();
        const { data, error } = await anon.auth.signInWithPassword({ email, password });
        if (error || !data.session || !data.user) {
            throw new error_middleware_1.AppError('Invalid email or password.', 401);
        }
        return {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
        };
    }
    async migrateLegacyUserToSupabase(email, password) {
        const user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE email = ?', [email]);
        if (!user?.password_hash)
            return false;
        const valid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!valid)
            return false;
        const admin = (0, supabase_1.getSupabaseAdmin)();
        try {
            const { data, error } = await admin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    first_name: user.first_name,
                    last_name: user.last_name,
                },
            });
            if (!error && data.user) {
                await (0, database_1.executeUpdate)('UPDATE users SET auth_uid = ?, password_hash = NULL WHERE id = ?', [
                    data.user.id,
                    user.id,
                ]);
                logger_1.logger.info(`[Auth] Migrated legacy user ${email} to Supabase Auth`);
                return true;
            }
            // Account already in Supabase Auth — locate it, sync password, then link
            const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
                type: 'recovery',
                email,
            });
            const existingAuthUser = linkData?.user;
            if (linkError || !existingAuthUser) {
                logger_1.logger.error('[Auth] Legacy migration failed to resolve existing Auth user:', error || linkError);
                return false;
            }
            const { error: updateError } = await admin.auth.admin.updateUserById(existingAuthUser.id, {
                password,
                email_confirm: true,
            });
            if (updateError) {
                logger_1.logger.error('[Auth] Legacy migration password sync failed:', updateError);
                return false;
            }
            await (0, database_1.executeUpdate)('UPDATE users SET auth_uid = ?, password_hash = NULL WHERE id = ?', [
                existingAuthUser.id,
                user.id,
            ]);
            logger_1.logger.info(`[Auth] Linked legacy user ${email} to existing Supabase Auth account`);
            return true;
        }
        catch (err) {
            logger_1.logger.error('[Auth] Legacy migration threw unexpectedly:', err);
            return false;
        }
    }
    // ─── Legacy local JWT auth ──────────────────────────────────────────────────
    async registerLegacy(dto) {
        const existing = await (0, database_1.executeQueryOne)('SELECT id FROM users WHERE email = ?', [dto.email.toLowerCase().trim()]);
        if (existing) {
            throw new error_middleware_1.AppError('An account with this email address already exists.', 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(dto.password, SALT_ROUNDS);
        let userId;
        await (0, database_1.withTransaction)(async (conn) => {
            const [userResult] = await conn.execute(`INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, token_version)
         VALUES (?, ?, ?, ?, ?, ?, 0)`, [
                dto.email.toLowerCase().trim(),
                passwordHash,
                dto.first_name.trim(),
                dto.last_name.trim(),
                dto.phone || null,
                dto.date_of_birth || null,
            ]);
            userId = userResult.insertId;
            await conn.execute(`INSERT INTO user_roles (user_id, role) VALUES (?, 'customer')`, [userId]);
            await conn.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
        });
        const user = await this.findUserWithRoles(userId);
        if (!user)
            throw new error_middleware_1.AppError('Failed to create account.', 500);
        const tokens = this.generateTokens(user);
        notification_service_1.notificationService.sendWelcomeEmail({ email: user.email, first_name: user.first_name });
        const { password_hash, ...safeUser } = user;
        return { ...tokens, user: safeUser };
    }
    // ── Development-only: bypass password hashing with .env credentials ──────
    async tryDevLogin(email, password) {
        const normEmail = email.toLowerCase().trim();
        logger_1.logger.info(`[AuthDev] Login attempt for email: "${normEmail}"`);
        logger_1.logger.info(`[AuthDev] Env credentials: ADMIN_EMAIL="${process.env.ADMIN_EMAIL}", ADMIN_PASSWORD="${process.env.ADMIN_PASSWORD}"`);
        const devAccounts = [
            { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, fallbackRole: 'admin' },
            { email: process.env.DEVELOPER_EMAIL, password: process.env.DEVELOPER_PASSWORD, fallbackRole: 'developer' },
            { email: process.env.STAFF_EMAIL, password: process.env.STAFF_PASSWORD, fallbackRole: 'specialist' },
        ];
        const match = devAccounts.find((a) => a.email && a.password && a.email.toLowerCase().trim() === normEmail && a.password === password);
        if (!match) {
            logger_1.logger.warn(`[AuthDev] No dev credential match found for email "${normEmail}". Match was: ${JSON.stringify(match)}`);
            return null;
        }
        let user = await this.findUserWithRoles(undefined, normEmail);
        if (!user) {
            // Build a minimal in-memory user so token generation works even if
            // the row doesn't exist in the DB yet.
            user = {
                id: 0,
                email: normEmail,
                password_hash: '',
                first_name: match.fallbackRole === 'admin' ? 'Admin' : match.fallbackRole === 'developer' ? 'Developer' : 'Staff',
                last_name: 'User',
                phone: null,
                date_of_birth: null,
                profile_photo_url: null,
                google_id: null,
                token_version: 0,
                is_active: true,
                email_verified: true,
                created_at: new Date(),
                updated_at: new Date(),
                roles: [match.fallbackRole],
            };
        }
        const resolvedUser = user;
        const tokens = this.generateTokens(resolvedUser);
        logger_1.logger.info(`[Auth] DEV login (env creds): ${resolvedUser.email} roles=${resolvedUser.roles}`);
        const { password_hash: _ph, ...safeUser } = resolvedUser;
        return { ...tokens, user: safeUser };
    }
    async loginLegacy(email, password) {
        const normEmail = email.toLowerCase().trim();
        const user = await this.findUserWithRoles(undefined, normEmail);
        if (!user) {
            throw new error_middleware_1.AppError('Invalid email or password.', 401);
        }
        if (!user.is_active) {
            throw new error_middleware_1.AppError('Your account has been suspended. Please contact support.', 403);
        }
        const passwordValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!passwordValid) {
            throw new error_middleware_1.AppError('Invalid email or password.', 401);
        }
        const tokens = this.generateTokens(user);
        logger_1.logger.info(`[Auth] User logged in: ${user.email} (ID: ${user.id})`);
        await (0, database_1.executeUpdate)('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        const { password_hash, ...safeUser } = user;
        return { ...tokens, user: safeUser };
    }
    // ─── Google OAuth (legacy tokens for now) ───────────────────────────────────
    async getOAuthClient() {
        const keys = ['google_oauth_client_id', 'google_oauth_client_secret', 'google_oauth_redirect_urls'];
        const placeholders = keys.map(() => '?').join(',');
        const rows = await (0, database_1.executeQuery)(`SELECT setting_key, setting_value FROM business_settings WHERE setting_key IN (${placeholders})`, keys);
        const settings = {};
        for (const row of rows) {
            const raw = row.setting_value;
            settings[row.setting_key] =
                typeof raw === 'string' ? JSON.parse(raw) : (raw ?? '');
        }
        const clientId = settings['google_oauth_client_id'] || process.env.GOOGLE_CLIENT_ID;
        const clientSecret = settings['google_oauth_client_secret'] || process.env.GOOGLE_CLIENT_SECRET;
        const redirectUrl = settings['google_oauth_redirect_urls'] ||
            process.env.GOOGLE_CALLBACK_URL ||
            'http://localhost:3000/api/auth/google/callback';
        if (!clientId || !clientSecret) {
            throw new error_middleware_1.AppError('Google OAuth is not properly configured on the server.', 500);
        }
        return new google_auth_library_1.OAuth2Client(clientId, clientSecret, redirectUrl);
    }
    async getGoogleAuthUrl(action = 'login') {
        const client = await this.getOAuthClient();
        return client.generateAuthUrl({
            access_type: 'offline',
            scope: ['openid', 'email', 'profile'],
            prompt: 'consent',
            state: action,
        });
    }
    async handleGoogleCallback(code, action = 'login') {
        const client = await this.getOAuthClient();
        let tokens;
        try {
            const { tokens: t } = await client.getToken(code);
            tokens = t;
        }
        catch (error) {
            logger_1.logger.error('Google token exchange failed:', error);
            throw new error_middleware_1.AppError('Invalid Google authorization code.', 401);
        }
        if (!tokens.id_token) {
            throw new error_middleware_1.AppError('Google did not return an ID token.', 401);
        }
        let payload;
        try {
            const ticket = await client.verifyIdToken({ idToken: tokens.id_token });
            payload = ticket.getPayload();
        }
        catch (error) {
            logger_1.logger.error('Google token verification failed:', error);
            throw new error_middleware_1.AppError('Invalid Google token.', 401);
        }
        if (!payload || !payload.email) {
            throw new error_middleware_1.AppError('Google authentication data is incomplete.', 400);
        }
        const email = payload.email.toLowerCase();
        const googleId = payload.sub;
        const firstName = payload.given_name || 'User';
        const lastName = payload.family_name || '';
        const picture = payload.picture || null;
        let user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email]);
        if (!user) {
            if (action !== 'register') {
                throw new error_middleware_1.AppError('No account found. Please register first.', 404, 'ACCOUNT_NOT_FOUND');
            }
            const passwordHash = await bcryptjs_1.default.hash((0, uuid_1.v4)(), SALT_ROUNDS);
            let authUid = null;
            if ((0, supabase_1.isSupabaseAuthEnabled)()) {
                const admin = (0, supabase_1.getSupabaseAdmin)();
                const { data, error } = await admin.auth.admin.createUser({
                    email,
                    email_confirm: true,
                    user_metadata: { first_name: firstName, last_name: lastName, google_id: googleId },
                });
                if (!error && data.user)
                    authUid = data.user.id;
            }
            const insertId = await (0, database_1.withTransaction)(async (conn) => {
                const [res] = await conn.execute(`INSERT INTO users (email, password_hash, first_name, last_name, google_id, profile_photo_url, authentication_method, auth_uid, last_login)
           VALUES (?, ?, ?, ?, ?, ?, 'Google OAuth', ?, NOW())`, [email, passwordHash, firstName, lastName, googleId, picture, authUid]);
                await conn.execute(`INSERT INTO user_roles (user_id, role) VALUES (?, 'customer')`, [res.insertId]);
                return res.insertId;
            });
            user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE id = ?', [insertId]);
        }
        else {
            await (0, database_1.executeUpdate)(`UPDATE users SET google_id = COALESCE(google_id, ?), profile_photo_url = COALESCE(profile_photo_url, ?), authentication_method = 'Google OAuth', last_login = NOW() WHERE id = ?`, [googleId, picture, user.id]);
        }
        const userWithRoles = await this.findUserWithRoles(user.id);
        if (!userWithRoles)
            throw new error_middleware_1.AppError('Account error.', 500);
        // Google still returns app JWTs; middleware accepts both
        const authTokens = this.generateTokens(userWithRoles);
        const { password_hash, ...safeUser } = userWithRoles;
        return { ...authTokens, user: safeUser };
    }
    async refreshTokens(refreshToken) {
        if ((0, supabase_1.isSupabaseAuthEnabled)()) {
            const anon = (0, supabase_1.getSupabaseAnon)();
            const { data, error } = await anon.auth.refreshSession({ refresh_token: refreshToken });
            if (!error && data.session) {
                return {
                    accessToken: data.session.access_token,
                    refreshToken: data.session.refresh_token,
                };
            }
            // Fall through — cookie may still hold a legacy refresh JWT
        }
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw new error_middleware_1.AppError('Invalid or expired refresh token.', 401);
        }
        const user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE id = ?', [payload.userId]);
        if (!user || user.token_version !== payload.tokenVersion) {
            throw new error_middleware_1.AppError('Session invalidated. Please log in again.', 401);
        }
        const userWithRoles = await this.findUserWithRoles(user.id);
        if (!userWithRoles)
            throw new error_middleware_1.AppError('Account error.', 500);
        return this.generateTokens(userWithRoles);
    }
    async logout(userId) {
        await (0, database_1.executeUpdate)('UPDATE users SET token_version = token_version + 1 WHERE id = ?', [userId]);
        if ((0, supabase_1.isSupabaseAuthEnabled)()) {
            const row = await (0, database_1.executeQueryOne)('SELECT auth_uid FROM users WHERE id = ?', [
                userId,
            ]);
            if (row?.auth_uid) {
                try {
                    await (0, supabase_1.getSupabaseAdmin)().auth.admin.signOut(row.auth_uid);
                }
                catch (err) {
                    logger_1.logger.warn('[Auth] Supabase signOut failed:', err);
                }
            }
        }
        logger_1.logger.info(`[Auth] User logged out: ID ${userId}`);
    }
    /**
     * Always resolves successfully to avoid email enumeration.
     * Sends a reset link when an active account exists.
     */
    async requestPasswordReset(email) {
        const normalized = email.toLowerCase().trim();
        const user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [normalized]);
        if (!user) {
            logger_1.logger.info(`[Auth] Password reset requested for unknown email: ${normalized}`);
            return;
        }
        const token = (0, jwt_1.signPasswordResetToken)({
            userId: user.id,
            email: user.email,
        });
        await notification_service_1.notificationService.sendPasswordReset({ email: user.email, first_name: user.first_name }, token);
        logger_1.logger.info(`[Auth] Password reset email queued for user ID ${user.id}`);
    }
    async resetPasswordWithToken(token, newPassword) {
        let payload;
        try {
            payload = (0, jwt_1.verifyPasswordResetToken)(token);
        }
        catch {
            throw new error_middleware_1.AppError('This reset link is invalid or has expired. Please request a new one.', 400);
        }
        const user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE id = ? AND email = ? AND is_active = TRUE', [payload.userId, payload.email.toLowerCase()]);
        if (!user) {
            throw new error_middleware_1.AppError('This reset link is invalid or has expired. Please request a new one.', 400);
        }
        if ((0, supabase_1.isSupabaseAuthEnabled)()) {
            const admin = (0, supabase_1.getSupabaseAdmin)();
            let authUid = user.auth_uid || null;
            if (!authUid) {
                const { data: created, error: createError } = await admin.auth.admin.createUser({
                    email: user.email,
                    password: newPassword,
                    email_confirm: true,
                    user_metadata: {
                        first_name: user.first_name,
                        last_name: user.last_name,
                    },
                });
                if (createError || !created.user) {
                    const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
                    const match = listed.data.users.find((u) => u.email?.toLowerCase() === user.email.toLowerCase());
                    if (!match) {
                        throw new error_middleware_1.AppError(createError?.message || 'Unable to update password. Please contact support.', 400);
                    }
                    authUid = match.id;
                    const { error: updateError } = await admin.auth.admin.updateUserById(authUid, {
                        password: newPassword,
                    });
                    if (updateError)
                        throw new error_middleware_1.AppError(updateError.message, 400);
                }
                else {
                    authUid = created.user.id;
                }
            }
            else {
                const { error } = await admin.auth.admin.updateUserById(authUid, {
                    password: newPassword,
                });
                if (error)
                    throw new error_middleware_1.AppError(error.message, 400);
            }
            await (0, database_1.executeUpdate)('UPDATE users SET password_hash = NULL, auth_uid = ?, token_version = token_version + 1 WHERE id = ?', [authUid, user.id]);
            return;
        }
        const newHash = await bcryptjs_1.default.hash(newPassword, SALT_ROUNDS);
        await (0, database_1.executeUpdate)('UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?', [newHash, user.id]);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user)
            throw new error_middleware_1.AppError('User not found.', 404);
        if ((0, supabase_1.isSupabaseAuthEnabled)() && user.auth_uid) {
            // Verify current password via sign-in
            try {
                await this.signInSupabase(user.email, currentPassword);
            }
            catch {
                throw new error_middleware_1.AppError('Current password is incorrect.', 400);
            }
            const { error } = await (0, supabase_1.getSupabaseAdmin)().auth.admin.updateUserById(user.auth_uid, {
                password: newPassword,
            });
            if (error)
                throw new error_middleware_1.AppError(error.message, 400);
            await (0, database_1.executeUpdate)('UPDATE users SET token_version = token_version + 1 WHERE id = ?', [userId]);
            return;
        }
        const valid = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!valid)
            throw new error_middleware_1.AppError('Current password is incorrect.', 400);
        const newHash = await bcryptjs_1.default.hash(newPassword, SALT_ROUNDS);
        await (0, database_1.executeUpdate)('UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?', [newHash, userId]);
    }
    async findUserWithRoles(userId, email, authUid) {
        let whereClause = 'u.id = ?';
        let param = userId;
        if (authUid) {
            whereClause = 'u.auth_uid = ?';
            param = authUid;
        }
        else if (email) {
            whereClause = 'u.email = ?';
            param = email;
        }
        const rows = await (0, database_1.executeQuery)(`SELECT u.*, ur.role
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       WHERE ${whereClause}`, [param]);
        if (!rows.length)
            return null;
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
    generateTokens(user) {
        return {
            accessToken: (0, jwt_1.signAccessToken)({
                userId: user.id,
                email: user.email,
                roles: user.roles,
            }),
            refreshToken: (0, jwt_1.signRefreshToken)({
                userId: user.id,
                tokenVersion: user.token_version,
            }),
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map