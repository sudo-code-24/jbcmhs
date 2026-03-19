export type UserRole = "admin" | "faculty";
export type AuthJwtPayload = {
    email: string;
    issuedAt: number;
    role?: UserRole;
};
export declare function getJwtExpiresInSeconds(): number;
export declare function signAuthToken(email: string, role?: UserRole): string;
export declare function verifyAuthToken(token: string): AuthJwtPayload;
//# sourceMappingURL=jwt.d.ts.map