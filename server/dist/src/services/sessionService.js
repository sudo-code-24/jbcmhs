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
const redis_1 = require("../lib/redis");
const sessions = new Map();
const redis = (0, redis_1.getRedisClient)();
function now() {
    return Date.now();
}
function generateSessionId() {
    return crypto_1.default.randomBytes(24).toString("hex");
}
function getSessionKey(sessionId) {
    return `session:${sessionId}`;
}
function getSecondsUntil(expiryMs) {
    return Math.max(1, Math.floor((expiryMs - now()) / 1000));
}
async function createSession(input) {
    const sessionId = generateSessionId();
    const record = {
        sessionId,
        userEmail: input.userEmail,
        jwtToken: input.jwtToken,
        expiresAt: input.expiresAt,
        isRevoked: false,
    };
    if (redis) {
        await redis.set(getSessionKey(sessionId), record, {
            ex: getSecondsUntil(record.expiresAt),
        });
    }
    else {
        sessions.set(sessionId, record);
    }
    return record;
}
async function getSession(sessionId) {
    if (redis) {
        const existing = await redis.get(getSessionKey(sessionId));
        if (!existing)
            return null;
        return existing;
    }
    const existing = sessions.get(sessionId);
    if (!existing)
        return null;
    return existing;
}
async function revokeSession(sessionId) {
    if (redis) {
        const existing = await redis.get(getSessionKey(sessionId));
        if (!existing)
            return;
        const updated = { ...existing, isRevoked: true };
        await redis.set(getSessionKey(sessionId), updated, {
            ex: getSecondsUntil(updated.expiresAt),
        });
        return;
    }
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
    if (redis)
        return;
    const current = now();
    for (const [id, session] of sessions.entries()) {
        if (session.expiresAt <= current || session.isRevoked) {
            sessions.delete(id);
        }
    }
}
setInterval(cleanupExpiredSessions, 5 * 60 * 1000).unref();
//# sourceMappingURL=sessionService.js.map