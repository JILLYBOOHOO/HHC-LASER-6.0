import { Request, Response } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/auth.service';
import { successResponse, errorResponse } from '../models/types';
import { env } from '../config/env';

export const registerValidators = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number.'),
  body('first_name').trim().notEmpty().isLength({ max: 50 }).withMessage('First name is required.'),
  body('last_name').trim().notEmpty().isLength({ max: 50 }).withMessage('Last name is required.'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number format.'),
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date format (use YYYY-MM-DD).'),
];

export const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
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

  async me(req: Request, res: Response): Promise<void> {
    res.json(successResponse(req.user));
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}

export const authController = new AuthController();
