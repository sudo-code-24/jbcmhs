import { NextFunction, Request, Response } from "express";
import type { UserRole } from "../lib/jwt";

/**
 * Require the authenticated user to have one of the allowed roles.
 * Must be used after authMiddleware.
 */
export function requireRole(allowedRoles: UserRole[]) {
  const set = new Set(allowedRoles);
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as Request & { user?: { email: string; sessionId: string; role: UserRole } };
    const role = authReq.user?.role;
    if (!role || !set.has(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
