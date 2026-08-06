"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const express_validator_1 = require("express-validator");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
const authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
});
// POST /api/auth/register
router.post('/register', authRateLimiter, auth_controller_1.registerValidators, validation_middleware_1.validateRequest, (req, res, next) => auth_controller_1.authController.register(req, res).catch(next));
// POST /api/auth/login
router.post('/login', authRateLimiter, auth_controller_1.loginValidators, validation_middleware_1.validateRequest, (req, res, next) => auth_controller_1.authController.login(req, res).catch(next));
// POST /api/auth/forgot-password
router.post('/forgot-password', authRateLimiter, auth_controller_1.forgotPasswordValidators, validation_middleware_1.validateRequest, (req, res, next) => auth_controller_1.authController.forgotPassword(req, res).catch(next));
// POST /api/auth/reset-password
router.post('/reset-password', authRateLimiter, auth_controller_1.resetPasswordValidators, validation_middleware_1.validateRequest, (req, res, next) => auth_controller_1.authController.resetPassword(req, res).catch(next));
// GET /api/auth/google
router.get('/google', authRateLimiter, (req, res, next) => auth_controller_1.authController.googleRedirect(req, res).catch(next));
// GET /api/auth/google/callback
router.get('/google/callback', authRateLimiter, (req, res, next) => auth_controller_1.authController.googleCallback(req, res).catch(next));
// POST /api/auth/refresh
router.post('/refresh', (req, res, next) => auth_controller_1.authController.refresh(req, res).catch(next));
// POST /api/auth/logout
router.post('/logout', auth_middleware_1.authenticate, (req, res, next) => auth_controller_1.authController.logout(req, res).catch(next));
// PUT /api/auth/change-password
router.put('/change-password', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('current_password').notEmpty().withMessage('Current password is required.'),
    (0, express_validator_1.body)('new_password')
        .isLength({ min: 8 })
        .matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
        .withMessage('New password must be at least 8 characters with uppercase, lowercase, and number.'),
], validation_middleware_1.validateRequest, (req, res, next) => auth_controller_1.authController.changePassword(req, res).catch(next));
// GET /api/auth/me
router.get('/me', auth_middleware_1.authenticate, (req, res, next) => auth_controller_1.authController.me(req, res).catch(next));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map