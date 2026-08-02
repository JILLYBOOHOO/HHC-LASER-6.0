"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLES = void 0;
exports.requireRole = requireRole;
exports.requireSelfOrRole = requireSelfOrRole;
const types_1 = require("../models/types");
/**
 * Role-Based Access Control middleware factory.
 * Usage: requireRole('admin', 'manager')
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json((0, types_1.errorResponse)('Authentication required.'));
            return;
        }
        const userRoles = req.user.roles || [];
        const hasRole = roles.some(role => userRoles.includes(role));
        if (!hasRole) {
            res.status(403).json((0, types_1.errorResponse)(`Access denied. Required roles: ${roles.join(', ')}. Your roles: ${userRoles.join(', ')}.`));
            return;
        }
        next();
    };
}
/**
 * Checks that the authenticated user is accessing their own resource,
 * OR has an elevated role that grants access to any resource.
 */
function requireSelfOrRole(paramKey, ...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json((0, types_1.errorResponse)('Authentication required.'));
            return;
        }
        const targetId = parseInt(req.params[paramKey], 10);
        const isSelf = req.user.userId === targetId;
        const hasElevatedRole = allowedRoles.some(r => req.user.roles.includes(r));
        if (!isSelf && !hasElevatedRole) {
            res.status(403).json((0, types_1.errorResponse)('Access denied. You may only access your own resources.'));
            return;
        }
        next();
    };
}
exports.ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MANAGER: 'manager',
    SPECIALIST: 'specialist',
    CUSTOMER: 'customer',
};
//# sourceMappingURL=rbac.middleware.js.map