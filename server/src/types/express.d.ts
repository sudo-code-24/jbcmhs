import type { UserRole } from "../lib/jwt";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        sessionId: string;
        role?: UserRole;
      };
    }
  }
}
