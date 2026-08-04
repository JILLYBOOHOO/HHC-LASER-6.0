"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
const jwt_1 = require("../utils/jwt");
const types_1 = require("../models/types");
const publicRoutes_1 = require("../config/publicRoutes");
const database_1 = require("../config/database");
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
async function resolvePayloadFromSupabaseToken(token) {
    // getUser() validates HS256 and newer asymmetric (ES256) Supabase JWTs via JWKS
    const { data, error } = await (0, supabase_1.getSupabaseAnon)().auth.getUser(token);
    if (error || !data.user) {
        const err = new Error(error?.message || 'Invalid Supabase access token.');
        err.name = error?.message?.toLowerCase().includes('expired')
            ? 'TokenExpiredError'
            : 'JsonWebTokenError';
        throw err;
    }
    const authUid = data.user.id;
    const rows = await (0, database_1.executeQuery)(`SELECT u.id, u.email, u.is_active, ur.role
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     WHERE u.auth_uid = ?`, [authUid]);
    if (!rows.length) {
        const err = new Error('No local profile linked to this Supabase user.');
        err.name = 'JsonWebTokenError';
        err.code = 'NO_LOCAL_PROFILE';
        throw err;
    }
    if (!rows[0].is_active) {
        const err = new Error('Account suspended');
        err.name = 'JsonWebTokenError';
        err.code = 'ACCOUNT_SUSPENDED';
        throw err;
    }
    return {
        userId: rows[0].id,
        email: rows[0].email,
        roles: rows.map((r) => r.role).filter(Boolean),
        authUid,
    };
}
async function resolvePayloadFromToken(token) {
    if ((0, supabase_1.isSupabaseAuthEnabled)()) {
        try {
            return await resolvePayloadFromSupabaseToken(token);
        }
        catch (err) {
            if (err?.name === 'TokenExpiredError' ||
                err?.code === 'NO_LOCAL_PROFILE' ||
                err?.code === 'ACCOUNT_SUSPENDED') {
                throw err;
            }
            // Not a valid Supabase session token — try legacy app JWT (e.g. Google OAuth)
            logger_1.logger.debug?.('[Auth] Supabase token resolve failed, trying legacy JWT');
        }
    }
    return (0, jwt_1.verifyAccessToken)(token);
}
async function authenticate(req, res, next) {
    const path = req.originalUrl?.split('?')[0] || req.path;
    if ((0, publicRoutes_1.isPublicRoute)(path, req.method)) {
        next();
        return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json((0, types_1.errorResponse)('Authentication required. Please provide a valid Bearer token.'));
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = await resolvePayloadFromToken(token);
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json((0, types_1.errorResponse)('Access token has expired. Please refresh your token.'));
        }
        else if (error.name === 'JsonWebTokenError') {
            res.status(401).json((0, types_1.errorResponse)(error.message || 'Invalid access token.'));
        }
        else {
            logger_1.logger.warn('[Auth] Authentication failed:', error?.message || error);
            res.status(401).json((0, types_1.errorResponse)('Authentication failed.'));
        }
    }
}
/**
 * Optional authentication — populates req.user if token present, does not block.
 */
async function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        try {
            req.user = await resolvePayloadFromToken(authHeader.split(' ')[1]);
        }
        catch {
            // Token invalid — continue without user
        }
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map