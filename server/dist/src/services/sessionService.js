"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.revokeSession = revokeSession;
exports.isSessionValid = isSessionValid;
exports.cleanupExpiredSessions = cleanupExpiredSessions;
const crypto_1 = __importDefault(require("crypto"));
const sessions = new Map();
function now() {
    return Date.now();
}
function generateSessionId() {
    return crypto_1.default.randomBytes(24).toString("hex");
}
function createSession(input) {
    const sessionId = generateSessionId();
    const record = {
        sessionId,
        userEmail: input.userEmail,
        jwtToken: input.jwtToken,
        expiresAt: input.expiresAt,
        isRevoked: false,
    };
    sessions.set(sessionId, record);
    return record;
}
function getSession(sessionId) {
    const existing = sessions.get(sessionId);
    if (!existing)
        return null;
    return existing;
}
function revokeSession(sessionId) {
    const existing = sessions.get(sessionId);
    if (!existing)
        return;
    existing.isRevoked = true;
    sessions.set(sessionId, existing);
}
function isSessionValid(session) {
    if (!session)
        return false;
    if (session.isRevoked)
        return false;
    if (session.expiresAt <= now())
        return false;
    return true;
}
function cleanupExpiredSessions() {
    const current = now();
    for (const [id, session] of sessions.entries()) {
        if (session.expiresAt <= current || session.isRevoked) {
            sessions.delete(id);
        }
    }
}
setInterval(cleanupExpiredSessions, 5 * 60 * 1000).unref();
//# sourceMappingURL=sessionService.js.map