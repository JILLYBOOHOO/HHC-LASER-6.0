"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = exports.resetPasswordValidators = exports.forgotPasswordValidators = exports.loginValidators = exports.registerValidators = void 0;
const express_validator_1 = require("express-validator");
const auth_service_1 = require("../services/auth.service");
const types_1 = require("../models/types");
const env_1 = require("../config/env");
const database_1 = require("../config/database");
exports.registerValidators = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('A valid email address is required.'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
        .matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and a number.'),
    (0, express_validator_1.body)('first_name').trim().notEmpty().isLength({ max: 50 }).withMessage('First name is required.'),
    (0, express_validator_1.body)('last_name').trim().notEmpty().isLength({ max: 50 }).withMessage('Last name is required.'),
    (0, express_validator_1.body)('phone')
        .optional({ values: 'falsy' })
        .trim()
        .matches(/^[+\d][\d\s().-]{6,20}$/)
        .withMessage('Invalid phone number format.'),
    (0, express_validator_1.body)('date_of_birth')
        .optional({ values: 'falsy' })
        .isISO8601({ strict: true })
        .withMessage('Invalid date format (use YYYY-MM-DD).'),
];
exports.loginValidators = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required.'),
];
exports.forgotPasswordValidators = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
];
exports.resetPasswordValidators = [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Reset token is required.'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
        .matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and a number.'),
];
class AuthController {
    async register(req, res) {
        const result = await auth_service_1.authService.register(req.body);
        this.setRefreshTokenCookie(res, result.refreshToken);
        res.status(201).json((0, types_1.successResponse)({
            accessToken: result.accessToken,
            user: result.user,
        }, 'Account created successfully. Welcome to HHC LASER!'));
    }
    async login(req, res) {
        const { email, password } = req.body;
        const result = await auth_service_1.authService.login(email, password);
        this.setRefreshTokenCookie(res, result.refreshToken);
        res.json((0, types_1.successResponse)({
            accessToken: result.accessToken,
            user: result.user,
        }, 'Login successful.'));
    }
    async googleRedirect(req, res) {
        try {
            const action = req.query.action || 'login';
            const url = await auth_service_1.authService.getGoogleAuthUrl(action);
            res.redirect(url);
        }
        catch (error) {
            const status = error.statusCode || 500;
            res.status(status).json((0, types_1.errorResponse)(error.message));
        }
    }
    async googleCallback(req, res) {
        const code = req.query.code;
        const state = req.query.state;
        const frontendCallbackUrl = env_1.env.FRONTEND_URL + '/auth/callback';
        if (!code) {
            res.redirect(`${frontendCallbackUrl}?error=Google authentication failed: No code provided.`);
            return;
        }
        try {
            const result = await auth_service_1.authService.handleGoogleCallback(code, state);
            this.setRefreshTokenCookie(res, result.refreshToken);
            // Redirect back to frontend with the access token
            res.redirect(`${frontendCallbackUrl}?token=${result.accessToken}`);
        }
        catch (error) {
            // Redirect with error
            if (error.errorCode) {
                res.redirect(`${frontendCallbackUrl}?error=${encodeURIComponent(error.message || 'Authentication failed')}&errorCode=${encodeURIComponent(error.errorCode)}`);
            }
            else {
                res.redirect(`${frontendCallbackUrl}?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
            }
        }
    }
    async refresh(req, res) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            res.status(401).json((0, types_1.errorResponse)('No refresh token provided.'));
            return;
        }
        const tokens = await auth_service_1.authService.refreshTokens(refreshToken);
        this.setRefreshTokenCookie(res, tokens.refreshToken);
        res.json((0, types_1.successResponse)({ accessToken: tokens.accessToken }));
    }
    async logout(req, res) {
        if (req.user) {
            await auth_service_1.authService.logout(req.user.userId);
        }
        res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
        res.json((0, types_1.successResponse)(undefined, 'Logged out successfully.'));
    }
    async changePassword(req, res) {
        const { current_password, new_password } = req.body;
        await auth_service_1.authService.changePassword(req.user.userId, current_password, new_password);
        res.json((0, types_1.successResponse)(undefined, 'Password changed successfully.'));
    }
    async forgotPassword(req, res) {
        const { email } = req.body;
        await auth_service_1.authService.requestPasswordReset(email);
        res.json((0, types_1.successResponse)(undefined, 'If an account exists for that email, a password reset link has been sent.'));
    }
    async resetPassword(req, res) {
        const { token, password } = req.body;
        await auth_service_1.authService.resetPasswordWithToken(token, password);
        res.json((0, types_1.successResponse)(undefined, 'Password updated successfully. You can sign in now.'));
    }
    async me(req, res) {
        const rows = await (0, database_1.executeQuery)(`SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.date_of_birth,
              u.profile_photo_url, u.is_active, u.email_verified, u.created_at, u.updated_at, ur.role
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       WHERE u.id = ?`, [req.user.userId]);
        if (!rows.length) {
            res.status(404).json((0, types_1.errorResponse)('User not found.'));
            return;
        }
        const base = rows[0];
        const user = {
            id: base.id,
            email: base.email,
            first_name: base.first_name,
            last_name: base.last_name,
            phone: base.phone,
            date_of_birth: base.date_of_birth,
            profile_photo_url: base.profile_photo_url,
            is_active: base.is_active,
            email_verified: base.email_verified,
            created_at: base.created_at,
            updated_at: base.updated_at,
            roles: rows.map((r) => r.role).filter(Boolean),
        };
        res.json((0, types_1.successResponse)({ user }));
    }
    setRefreshTokenCookie(res, token) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: env_1.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/api/auth/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map