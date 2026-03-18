export type AuthJwtPayload = {
    email: string;
    issuedAt: number;
};
export declare function getJwtExpiresInSeconds(): number;
export declare function signAuthToken(email: string): string;
export declare function verifyAuthToken(token: string): AuthJwtPayload;
//# sourceMappingURL=jwt.d.ts.map