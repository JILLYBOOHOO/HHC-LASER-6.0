import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { errorResponse, UserRole } from '../models/types';
import { isPublicRoute } from '../config/publicRoutes';
import { executeQuery } from '../config/database';
import { getSupabaseAnon, isSupabaseAuthEnabled } from '../config/supabase';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

async function resolvePayloadFromSupabaseToken(token: string): Promise<JwtPayload> {
  // getUser() validates HS256 and newer asymmetric (ES256) Supabase JWTs via JWKS
  const { data, error } = await getSupabaseAnon().auth.getUser(token);

  if (error || !data.user) {
    const err: any = new Error(error?.message || 'Invalid Supabase access token.');
    err.name = error?.message?.toLowerCase().includes('expired')
      ? 'TokenExpiredError'
      : 'JsonWebTokenError';
    throw err;
  }

  const authUid = data.user.id;
  const rows = await executeQuery<{
    id: number;
    email: string;
    role: UserRole | null;
    is_active: boolean;
  }>(
    `SELECT u.id, u.email, u.is_active, ur.role
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     WHERE u.auth_uid = ?`,
    [authUid]
  );

  if (!rows.length) {
    const err: any = new Error('No local profile linked to this Supabase user.');
    err.name = 'JsonWebTokenError';
    err.code = 'NO_LOCAL_PROFILE';
    throw err;
  }

  if (!rows[0].is_active) {
    const err: any = new Error('Account suspended');
    err.name = 'JsonWebTokenError';
    err.code = 'ACCOUNT_SUSPENDED';
    throw err;
  }

  return {
    userId: rows[0].id,
    email: rows[0].email,
    roles: rows.map((r) => r.role).filter(Boolean) as UserRole[],
    authUid,
  };
}

async function resolvePayloadFromToken(token: string): Promise<JwtPayload> {
  if (isSupabaseAuthEnabled()) {
    try {
      return await resolvePayloadFromSupabaseToken(token);
    } catch (err: any) {
      if (
        err?.name === 'TokenExpiredError' ||
        err?.code === 'NO_LOCAL_PROFILE' ||
        err?.code === 'ACCOUNT_SUSPENDED'
      ) {
        throw err;
      }
      // Not a valid Supabase session token — try legacy app JWT (e.g. Google OAuth)
      logger.debug?.('[Auth] Supabase token resolve failed, trying legacy JWT');
    }
  }

  return verifyAccessToken(token);
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const path = req.originalUrl?.split('?')[0] || req.path;
  if (isPublicRoute(path, req.method)) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(errorResponse('Authentication required. Please provide a valid Bearer token.'));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = await resolvePayloadFromToken(token);
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json(errorResponse('Access token has expired. Please refresh your token.'));
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json(errorResponse(error.message || 'Invalid access token.'));
    } else {
      logger.warn('[Auth] Authentication failed:', error?.message || error);
      res.status(401).json(errorResponse('Authentication failed.'));
    }
  }
}

/**
 * Optional authentication — populates req.user if token present, does not block.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = await resolvePayloadFromToken(authHeader.split(' ')[1]);
    } catch {
      // Token invalid — continue without user
    }
  }
  next();
}
