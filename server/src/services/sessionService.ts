import crypto from "crypto";
import { getRedisClient } from "../lib/redis";

export type SessionRecord = {
  sessionId: string;
  userEmail: string;
  jwtToken: string;
  expiresAt: number;
  isRevoked: boolean;
};

const sessions = new Map<string, SessionRecord>();
const redis = getRedisClient();

function now(): number {
  return Date.now();
}

function generateSessionId(): string {
  return crypto.randomBytes(24).toString("hex");
}

function getSessionKey(sessionId: string): string {
  return `session:${sessionId}`;
}

function getSecondsUntil(expiryMs: number): number {
  return Math.max(1, Math.floor((expiryMs - now()) / 1000));
}

export async function createSession(input: {
  userEmail: string;
  jwtToken: string;
  expiresAt: number;
}): Promise<SessionRecord> {
  const sessionId = generateSessionId();
  const record: SessionRecord = {
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
  } else {
    sessions.set(sessionId, record);
  }
  return record;
}

export async function getSession(sessionId: string): Promise<SessionRecord | null> {
  if (redis) {
    const existing = await redis.get<SessionRecord>(getSessionKey(sessionId));
    if (!existing) return null;
    return existing;
  }
  const existing = sessions.get(sessionId);
  if (!existing) return null;
  return existing;
}

export async function revokeSession(sessionId: string): Promise<void> {
  if (redis) {
    const existing = await redis.get<SessionRecord>(getSessionKey(sessionId));
    if (!existing) return;
    const updated: SessionRecord = { ...existing, isRevoked: true };
    await redis.set(getSessionKey(sessionId), updated, {
      ex: getSecondsUntil(updated.expiresAt),
    });
    return;
  }

  const existing = sessions.get(sessionId);
  if (!existing) return;
  existing.isRevoked = true;
  sessions.set(sessionId, existing);
}

export function isSessionValid(session: SessionRecord | null): boolean {
  if (!session) return false;
  if (session.isRevoked) return false;
  if (session.expiresAt <= now()) return false;
  return true;
}

export function cleanupExpiredSessions(): void {
  if (redis) return;
  const current = now();
  for (const [id, session] of sessions.entries()) {
    if (session.expiresAt <= current || session.isRevoked) {
      sessions.delete(id);
    }
  }
}

setInterval(cleanupExpiredSessions, 5 * 60 * 1000).unref();
