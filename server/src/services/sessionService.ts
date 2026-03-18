import crypto from "crypto";

export type SessionRecord = {
  sessionId: string;
  userEmail: string;
  jwtToken: string;
  expiresAt: number;
  isRevoked: boolean;
};

const sessions = new Map<string, SessionRecord>();

function now(): number {
  return Date.now();
}

function generateSessionId(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function createSession(input: {
  userEmail: string;
  jwtToken: string;
  expiresAt: number;
}): SessionRecord {
  const sessionId = generateSessionId();
  const record: SessionRecord = {
    sessionId,
    userEmail: input.userEmail,
    jwtToken: input.jwtToken,
    expiresAt: input.expiresAt,
    isRevoked: false,
  };
  sessions.set(sessionId, record);
  return record;
}

export function getSession(sessionId: string): SessionRecord | null {
  const existing = sessions.get(sessionId);
  if (!existing) return null;
  return existing;
}

export function revokeSession(sessionId: string): void {
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
  const current = now();
  for (const [id, session] of sessions.entries()) {
    if (session.expiresAt <= current || session.isRevoked) {
      sessions.delete(id);
    }
  }
}

setInterval(cleanupExpiredSessions, 5 * 60 * 1000).unref();
