import { NextFunction, Request, Response } from "express";
import type { UserRole } from "../lib/jwt";
/**
 * Require the authenticated user to have one of the allowed roles.
 * Must be used after authMiddleware.
 */
export declare function requireRole(allowedRoles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=requireRole.d.ts.map