"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.verifySupabaseAccessToken = verifySupabaseAccessToken;
exports.decodeToken = decodeToken;
exports.signPasswordResetToken = signPasswordResetToken;
exports.verifyPasswordResetToken = verifyPasswordResetToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const supabase_1 = require("../config/supabase");
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
        issuer: 'hhc-laser-api',
        audience: 'hhc-laser-client',
    });
}
function signRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
        issuer: 'hhc-laser-api',
    });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET, {
        issuer: 'hhc-laser-api',
        audience: 'hhc-laser-client',
    });
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET, {
        issuer: 'hhc-laser-api',
    });
}
/** Verify a Supabase-issued access token (HS256 with project JWT secret). */
function verifySupabaseAccessToken(token) {
    if (!(0, supabase_1.isSupabaseAuthEnabled)() || !env_1.env.SUPABASE_JWT_SECRET) {
        throw new jsonwebtoken_1.default.JsonWebTokenError('Supabase Auth is not configured');
    }
    return jsonwebtoken_1.default.verify(token, env_1.env.SUPABASE_JWT_SECRET);
}
function decodeToken(token) {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch {
        return null;
    }
}
function signPasswordResetToken(payload) {
    return jsonwebtoken_1.default.sign({ ...payload, purpose: 'password_reset' }, env_1.env.JWT_SECRET, {
        expiresIn: '15m',
        issuer: 'hhc-laser-api',
        audience: 'hhc-laser-password-reset',
    });
}
function verifyPasswordResetToken(token) {
    const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET, {
        issuer: 'hhc-laser-api',
        audience: 'hhc-laser-password-reset',
    });
    if (payload.purpose !== 'password_reset') {
        throw new jsonwebtoken_1.default.JsonWebTokenError('Invalid password reset token');
    }
    return payload;
}
//# sourceMappingURL=jwt.js.map