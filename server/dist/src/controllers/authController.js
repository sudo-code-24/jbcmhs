"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.changePassword = changePassword;
exports.listUsers = listUsers;
exports.deleteUser = deleteUser;
exports.resetPassword = resetPassword;
exports.logout = logout;
const authService = __importStar(require("../services/authService"));
const jwt_1 = require("../lib/jwt");
const sessionService_1 = require("../services/sessionService");
async function signup(req, res, next) {
    try {
        const payload = (req.body ?? {});
        const username = String(payload.username ?? "").trim();
        const email = String(payload.email ?? "").trim();
        const password = String(payload.password ?? "");
        if (!username || !password) {
            res.status(400).json({ error: "username and password are required" });
            return;
        }
        const computedEmail = email || `${username}@jbcmhs.local`;
        const created = await authService.signup(computedEmail, password, username);
        res.status(201).json({ success: true, user: created });
    }
    catch (err) {
        next(err);
    }
}
async function login(req, res, next) {
    try {
        const payload = (req.body ?? {});
        const identifier = String(payload.email ?? payload.username ?? "").trim();
        const password = String(payload.password ?? "");
        if (!identifier || !password) {
            res.status(400).json({ success: false, error: "username/email and password are required" });
            return;
        }
        const result = await authService.login(identifier, password);
        if (!result.success) {
            if (result.requiresPasswordChange) {
                res.status(403).json({
                    success: false,
                    requiresPasswordChange: true,
                    error: "Default password must be changed before signing in",
                });
                return;
            }
            res.status(401).json({ success: false, error: "Invalid email or password" });
            return;
        }
        const token = (0, jwt_1.signAuthToken)(result.userEmail);
        const expiresIn = (0, jwt_1.getJwtExpiresInSeconds)();
        const expiresAt = Date.now() + expiresIn * 1000;
        const session = (0, sessionService_1.createSession)({
            userEmail: result.userEmail,
            jwtToken: token,
            expiresAt,
        });
        res.json({
            success: true,
            token,
            sessionId: session.sessionId,
            expiresAt,
            user: { email: result.userEmail },
        });
    }
    catch (err) {
        next(err);
    }
}
async function changePassword(req, res, next) {
    try {
        const payload = (req.body ?? {});
        const identifier = String(payload.email ?? payload.username ?? "").trim();
        const currentPassword = String(payload.currentPassword ?? "");
        const newPassword = String(payload.newPassword ?? "");
        if (!identifier || !currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                error: "username/email, currentPassword, and newPassword are required",
            });
            return;
        }
        await authService.changePassword(identifier, currentPassword, newPassword);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
async function listUsers(_req, res, next) {
    try {
        const users = await authService.listUsers();
        res.json(users);
    }
    catch (err) {
        next(err);
    }
}
async function deleteUser(req, res, next) {
    try {
        await authService.deleteUser(req.params.username);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
async function resetPassword(req, res, next) {
    try {
        await authService.resetPassword(req.params.username);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
async function logout(req, res, next) {
    try {
        const authReq = req;
        if (!authReq.user?.sessionId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        (0, sessionService_1.revokeSession)(authReq.user.sessionId);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=authController.js.map