import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { errorResponse } from '../models/types';
import { PUBLIC_ROUTES } from '../config/publicRoutes';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Bypass authentication for whitelisted public routes
  if (isPublicRoute(req.path)) {
    return next();
  }
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(errorResponse('Authentication required. Please provide a valid Bearer token.'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json(errorResponse('Access token has expired. Please refresh your token.'));
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json(errorResponse('Invalid access token.'));
    } else {
      res.status(401).json(errorResponse('Authentication failed.'));
    }
  }
}

/**
 * Optional authentication — populates req.user if token present, does not block.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(authHeader.split(' ')[1]);
    } catch {
      // Token invalid — continue without user
    }
  }
  next();
}
