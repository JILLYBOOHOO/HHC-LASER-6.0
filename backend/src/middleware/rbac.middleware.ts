import { Request, Response, NextFunction } from 'express';
import { UserRole, errorResponse } from '../models/types';

/**
 * Role-Based Access Control middleware factory.
 * Usage: requireRole('admin', 'manager')
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(errorResponse('Authentication required.'));
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json(
        errorResponse(`Access denied. Required roles: ${roles.join(', ')}. Your roles: ${userRoles.join(', ')}.`)
      );
      return;
    }

    next();
  };
}

/**
 * Checks that the authenticated user is accessing their own resource,
 * OR has an elevated role that grants access to any resource.
 */
export function requireSelfOrRole(paramKey: string, ...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(errorResponse('Authentication required.'));
      return;
    }

    const targetId = parseInt(req.params[paramKey], 10);
    const isSelf = req.user.userId === targetId;
    const hasElevatedRole = allowedRoles.some(r => req.user!.roles.includes(r));

    if (!isSelf && !hasElevatedRole) {
      res.status(403).json(errorResponse('Access denied. You may only access your own resources.'));
      return;
    }

    next();
  };
}

export const ROLES = {
  OWNER: 'owner' as UserRole,
  ADMIN: 'admin' as UserRole,
  MANAGER: 'manager' as UserRole,
  SPECIALIST: 'specialist' as UserRole,
  CUSTOMER: 'customer' as UserRole,
} as const;
