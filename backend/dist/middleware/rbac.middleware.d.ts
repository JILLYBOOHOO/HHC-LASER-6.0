import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/types';
/**
 * Role-Based Access Control middleware factory.
 * Usage: requireRole('admin', 'manager')
 */
export declare function requireRole(...roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Checks that the authenticated user is accessing their own resource,
 * OR has an elevated role that grants access to any resource.
 */
export declare function requireSelfOrRole(paramKey: string, ...allowedRoles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
export declare const ROLES: {
    readonly OWNER: UserRole;
    readonly ADMIN: UserRole;
    readonly MANAGER: UserRole;
    readonly SPECIALIST: UserRole;
    readonly CUSTOMER: UserRole;
};
//# sourceMappingURL=rbac.middleware.d.ts.map