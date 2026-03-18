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
}): Promise<SessionRecord>;
export declare function getSession(sessionId: string): Promise<SessionRecord | null>;
export declare function revokeSession(sessionId: string): Promise<void>;
export declare function isSessionValid(session: SessionRecord | null): boolean;
export declare function cleanupExpiredSessions(): void;
//# sourceMappingURL=sessionService.d.ts.map