import { UserRole } from '../models/types';
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
export declare function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;
export declare function signRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): RefreshTokenPayload;
/** Verify a Supabase-issued access token (HS256 with project JWT secret). */
export declare function verifySupabaseAccessToken(token: string): SupabaseJwtPayload;
export declare function decodeToken(token: string): JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map