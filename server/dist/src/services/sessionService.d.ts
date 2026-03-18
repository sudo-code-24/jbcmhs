export type SessionRecord = {
    sessionId: string;
    userEmail: string;
    jwtToken: string;
    expiresAt: number;
    isRevoked: boolean;
};
export declare function createSession(input: {
    userEmail: string;
    jwtToken: string;
    expiresAt: number;
}): SessionRecord;
export declare function getSession(sessionId: string): SessionRecord | null;
export declare function revokeSession(sessionId: string): void;
export declare function isSessionValid(session: SessionRecord | null): boolean;
export declare function cleanupExpiredSessions(): void;
//# sourceMappingURL=sessionService.d.ts.map