import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../models/types';
import { isSupabaseAuthEnabled } from '../config/supabase';

export interface JwtPayload {
  userId: number;
  email: string;
  roles: UserRole[];
  locationId?: number;
  authUid?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: number;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  aud?: string | string[];
  iat?: number;
  exp?: number;
}

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
    issuer: 'hhc-laser-api',
    audience: 'hhc-laser-client',
  });
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    issuer: 'hhc-laser-api',
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'hhc-laser-api',
    audience: 'hhc-laser-client',
  }) as JwtPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'hhc-laser-api',
  }) as RefreshTokenPayload;
}

/** Verify a Supabase-issued access token (HS256 with project JWT secret). */
export function verifySupabaseAccessToken(token: string): SupabaseJwtPayload {
  if (!isSupabaseAuthEnabled() || !env.SUPABASE_JWT_SECRET) {
    throw new jwt.JsonWebTokenError('Supabase Auth is not configured');
  }
  return jwt.verify(token, env.SUPABASE_JWT_SECRET) as SupabaseJwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}

export interface PasswordResetTokenPayload {
  purpose: 'password_reset';
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export function signPasswordResetToken(payload: Omit<PasswordResetTokenPayload, 'iat' | 'exp' | 'purpose'>): string {
  return jwt.sign(
    { ...payload, purpose: 'password_reset' as const },
    env.JWT_SECRET,
    {
      expiresIn: '15m',
      issuer: 'hhc-laser-api',
      audience: 'hhc-laser-password-reset',
    }
  );
}

export function verifyPasswordResetToken(token: string): PasswordResetTokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    issuer: 'hhc-laser-api',
    audience: 'hhc-laser-password-reset',
  }) as PasswordResetTokenPayload;

  if (payload.purpose !== 'password_reset') {
    throw new jwt.JsonWebTokenError('Invalid password reset token');
  }
  return payload;
}
