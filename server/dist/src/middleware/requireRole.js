"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
/**
 * Require the authenticated user to have one of the allowed roles.
 * Must be used after authMiddleware.
 */
function requireRole(allowedRoles) {
    const set = new Set(allowedRoles);
    return (req, res, next) => {
        const authReq = req;
        const role = authReq.user?.role;
        if (!role || !set.has(role)) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        next();
    };
}
//# sourceMappingURL=requireRole.js.map