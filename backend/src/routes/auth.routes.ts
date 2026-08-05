import { Router, Request, Response, NextFunction } from 'express';
import {
  authController,
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
});

// POST /api/auth/register
router.post(
  '/register',
  authRateLimiter,
  registerValidators,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => authController.register(req, res).catch(next)
);

// POST /api/auth/login
router.post(
  '/login',
  authRateLimiter,
  loginValidators,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => authController.login(req, res).catch(next)
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  authRateLimiter,
  forgotPasswordValidators,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => authController.forgotPassword(req, res).catch(next)
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  authRateLimiter,
  resetPasswordValidators,
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => authController.resetPassword(req, res).catch(next)
);

// GET /api/auth/google
router.get(
  '/google',
  authRateLimiter,
  (req, res, next) => authController.googleRedirect(req, res).catch(next)
);

// GET /api/auth/google/callback
router.get(
  '/google/callback',
  authRateLimiter,
  (req, res, next) => authController.googleCallback(req, res).catch(next)
);
// POST /api/auth/refresh
router.post(
  '/refresh',
  (req, res, next) => authController.refresh(req, res).catch(next)
);

// POST /api/auth/logout
router.post(
  '/logout',
  authenticate,
  (req, res, next) => authController.logout(req, res).catch(next)
);

// PUT /api/auth/change-password
router.put(
  '/change-password',
  authenticate,
  [
    body('current_password').notEmpty().withMessage('Current password is required.'),
    body('new_password')
      .isLength({ min: 8 })
      .matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
      .withMessage('New password must be at least 8 characters with uppercase, lowercase, and number.'),
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => authController.changePassword(req, res).catch(next)
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  (req, res, next) => authController.me(req, res).catch(next)
);

export default router;
