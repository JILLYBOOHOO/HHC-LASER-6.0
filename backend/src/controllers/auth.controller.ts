import { Request, Response } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/auth.service';
import { successResponse, errorResponse, UserRole } from '../models/types';
import { env } from '../config/env';
import { executeQuery } from '../config/database';

export const registerValidators = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number.'),
  body('first_name').trim().notEmpty().isLength({ max: 50 }).withMessage('First name is required.'),
  body('last_name').trim().notEmpty().isLength({ max: 50 }).withMessage('Last name is required.'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[+\d][\d\s().-]{6,20}$/)
    .withMessage('Invalid phone number format.'),
  body('date_of_birth')
    .optional({ values: 'falsy' })
    .isISO8601({ strict: true })
    .withMessage('Invalid date format (use YYYY-MM-DD).'),
];

export const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

export const forgotPasswordValidators = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
];

export const resetPasswordValidators = [
  body('token').notEmpty().withMessage('Reset token is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number.'),
];

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body);
    this.setRefreshTokenCookie(res, result.refreshToken);
    res.status(201).json(successResponse({
      accessToken: result.accessToken,
      user: result.user,
    }, 'Account created successfully. Welcome to HHC LASER!'));
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    this.setRefreshTokenCookie(res, result.refreshToken);
    res.json(successResponse({
      accessToken: result.accessToken,
      user: result.user,
    }, 'Login successful.'));
  }

  async googleRedirect(req: Request, res: Response): Promise<void> {
    try {
      const action = (req.query.action as 'login' | 'register') || 'login';
      const url = await authService.getGoogleAuthUrl(action);
      res.redirect(url);
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json(errorResponse(error.message));
    }
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const frontendCallbackUrl = env.FRONTEND_URL + '/auth/callback';

    if (!code) {
      res.redirect(`${frontendCallbackUrl}?error=Google authentication failed: No code provided.`);
      return;
    }

    try {
      const result = await authService.handleGoogleCallback(code, state);
      this.setRefreshTokenCookie(res, result.refreshToken);
      
      // Redirect back to frontend with the access token
      res.redirect(`${frontendCallbackUrl}?token=${result.accessToken}`);
    } catch (error: any) {
      // Redirect with error
      if (error.errorCode) {
        res.redirect(`${frontendCallbackUrl}?error=${encodeURIComponent(error.message || 'Authentication failed')}&errorCode=${encodeURIComponent(error.errorCode)}`);
      } else {
        res.redirect(`${frontendCallbackUrl}?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
      }
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json(errorResponse('No refresh token provided.'));
      return;
    }
    const tokens = await authService.refreshTokens(refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);
    res.json(successResponse({ accessToken: tokens.accessToken }));
  }

  async logout(req: Request, res: Response): Promise<void> {
    if (req.user) {
      await authService.logout(req.user.userId);
    }
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.json(successResponse(undefined, 'Logged out successfully.'));
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const { current_password, new_password } = req.body;
    await authService.changePassword(req.user!.userId, current_password, new_password);
    res.json(successResponse(undefined, 'Password changed successfully.'));
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    res.json(
      successResponse(
        undefined,
        'If an account exists for that email, a password reset link has been sent.'
      )
    );
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body;
    await authService.resetPasswordWithToken(token, password);
    res.json(successResponse(undefined, 'Password updated successfully. You can sign in now.'));
  }

  async me(req: Request, res: Response): Promise<void> {
    const rows = await executeQuery<any>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.date_of_birth,
              u.profile_photo_url, u.is_active, u.email_verified, u.created_at, u.updated_at, ur.role
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       WHERE u.id = ?`,
      [req.user!.userId]
    );

    if (!rows.length) {
      res.status(404).json(errorResponse('User not found.'));
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
      roles: rows.map((r) => r.role).filter(Boolean) as UserRole[],
    };

    res.json(successResponse({ user }));
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}

export const authController = new AuthController();
