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
const SALT_ROUNDS = 12;
class AuthService {
    async register(dto) {
        // Check if email already exists
        const existing = await (0, database_1.executeQueryOne)('SELECT id FROM users WHERE email = ?', [dto.email.toLowerCase().trim()]);
        if (existing) {
            throw new error_middleware_1.AppError('An account with this email address already exists.', 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(dto.password, SALT_ROUNDS);
        let userId;
        await (0, database_1.withTransaction)(async (conn) => {
            // Insert user
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
            // Assign default customer role
            await conn.execute(`INSERT INTO user_roles (user_id, role) VALUES (?, 'customer')`, [userId]);
            // Update last_login
            await conn.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
        });
        // Now that the transaction is committed, fetch user with roles
        const user = await this.findUserWithRoles(userId);
        if (!user)
            throw new error_middleware_1.AppError('Failed to create account.', 500);
        const tokens = this.generateTokens(user);
        notification_service_1.notificationService.sendWelcomeEmail({ email: user.email, first_name: user.first_name });
        const { password_hash, ...safeUser } = user;
        return { ...tokens, user: safeUser };
    }
    async login(email, password) {
        const user = await this.findUserWithRoles(undefined, email.toLowerCase().trim());
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
        // Update last_login
        await (0, database_1.executeUpdate)('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        const { password_hash, ...safeUser } = user;
        return { ...tokens, user: safeUser };
    }
    async getOAuthClient() {
        const keys = ['google_oauth_client_id', 'google_oauth_client_secret', 'google_oauth_redirect_urls'];
        const placeholders = keys.map(() => '?').join(',');
        const rows = await (0, database_1.executeQuery)(`SELECT setting_key, setting_value FROM business_settings WHERE setting_key IN (${placeholders})`, keys);
        const settings = {};
        for (const row of rows) {
            settings[row.setting_key] = row.setting_value ? JSON.parse(row.setting_value) : '';
        }
        const clientId = settings['google_oauth_client_id'] || process.env.GOOGLE_CLIENT_ID;
        const clientSecret = settings['google_oauth_client_secret'] || process.env.GOOGLE_CLIENT_SECRET;
        const redirectUrl = settings['google_oauth_redirect_urls'] || process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';
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
            state: action
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
            const ticket = await client.verifyIdToken({
                idToken: tokens.id_token,
            });
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
            // Auto-register Google user
            const dto = {
                email: email,
                password: (0, uuid_1.v4)(), // Random password — they use Google login only
                first_name: firstName,
                last_name: lastName,
            };
            // We need to bypass normal register method or update it to handle Google OAuth explicitly.
            // Since normal register sets Email Password, let's just insert here:
            const passwordHash = await bcryptjs_1.default.hash(dto.password, SALT_ROUNDS);
            const insertId = await (0, database_1.withTransaction)(async (conn) => {
                const [res] = await conn.execute(`INSERT INTO users (email, password_hash, first_name, last_name, google_id, profile_photo_url, authentication_method, last_login)
           VALUES (?, ?, ?, ?, ?, ?, 'Google OAuth', NOW())`, [email, passwordHash, firstName, lastName, googleId, picture]);
                await conn.execute(`INSERT INTO user_roles (user_id, role) VALUES (?, 'customer')`, [res.insertId]);
                return res.insertId;
            });
            user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE id = ?', [insertId]);
        }
        else {
            // Link Google ID and update picture if not already linked
            await (0, database_1.executeUpdate)('UPDATE users SET google_id = COALESCE(google_id, ?), profile_photo_url = COALESCE(profile_photo_url, ?), authentication_method = "Google OAuth", last_login = NOW() WHERE id = ?', [googleId, picture, user.id]);
        }
        const userWithRoles = await this.findUserWithRoles(user.id);
        if (!userWithRoles)
            throw new error_middleware_1.AppError('Account error.', 500);
        const authTokens = this.generateTokens(userWithRoles);
        const { password_hash, ...safeUser } = userWithRoles;
        return { ...authTokens, user: safeUser };
    }
    async refreshTokens(refreshToken) {
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
        // Increment token_version to invalidate all existing refresh tokens
        await (0, database_1.executeUpdate)('UPDATE users SET token_version = token_version + 1 WHERE id = ?', [userId]);
        logger_1.logger.info(`[Auth] User logged out: ID ${userId}`);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await (0, database_1.executeQueryOne)('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user)
            throw new error_middleware_1.AppError('User not found.', 404);
        const valid = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!valid)
            throw new error_middleware_1.AppError('Current password is incorrect.', 400);
        const newHash = await bcryptjs_1.default.hash(newPassword, SALT_ROUNDS);
        await (0, database_1.executeUpdate)('UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?', [newHash, userId]);
    }
    async findUserWithRoles(userId, email) {
        const whereClause = userId ? 'u.id = ?' : 'u.email = ?';
        const param = userId || email;
        const rows = await (0, database_1.executeQuery)(`SELECT u.*, ur.role
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       WHERE ${whereClause}`, [param]);
        if (!rows.length)
            return null;
        const base = rows[0];
        const user = {
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
            roles: rows.map(r => r.role).filter(Boolean),
        };
        return user;
    }
    generateTokens(user) {
        const accessToken = (0, jwt_1.signAccessToken)({
            userId: user.id,
            email: user.email,
            roles: user.roles,
        });
        const refreshToken = (0, jwt_1.signRefreshToken)({
            userId: user.id,
            tokenVersion: user.token_version,
        });
        return { accessToken, refreshToken };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map