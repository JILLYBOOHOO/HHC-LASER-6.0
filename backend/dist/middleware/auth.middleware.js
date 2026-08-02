"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
const jwt_1 = require("../utils/jwt");
const types_1 = require("../models/types");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json((0, types_1.errorResponse)('Authentication required. Please provide a valid Bearer token.'));
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json((0, types_1.errorResponse)('Access token has expired. Please refresh your token.'));
        }
        else if (error.name === 'JsonWebTokenError') {
            res.status(401).json((0, types_1.errorResponse)('Invalid access token.'));
        }
        else {
            res.status(401).json((0, types_1.errorResponse)('Authentication failed.'));
        }
    }
}
/**
 * Optional authentication — populates req.user if token present, does not block.
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        try {
            req.user = (0, jwt_1.verifyAccessToken)(authHeader.split(' ')[1]);
        }
        catch {
            // Token invalid — continue without user
        }
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map