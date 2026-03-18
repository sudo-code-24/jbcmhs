export type AuthUser = {
    username: string;
    email: string;
    hashedPassword: string;
    createdAt: string;
};
export type LoginResult = {
    success: true;
    userEmail: string;
} | {
    success: false;
    requiresPasswordChange?: boolean;
};
export type PublicAuthUser = {
    username: string;
    email: string;
    createdAt: string;
};
export declare function getUserByEmail(email: string): Promise<AuthUser | null>;
export declare function getUserByUsername(username: string): Promise<AuthUser | null>;
export declare function createUser(user: AuthUser): Promise<AuthUser>;
export declare function signup(email: string, password: string, usernameInput?: string): Promise<{
    username: string;
    email: string;
    createdAt: string;
}>;
export declare function getUserByIdentifier(identifier: string): Promise<AuthUser | null>;
export declare function login(identifier: string, password: string): Promise<LoginResult>;
export declare function changePassword(identifier: string, currentPassword: string, newPassword: string): Promise<void>;
export declare function listUsers(): Promise<PublicAuthUser[]>;
export declare function deleteUser(username: string): Promise<void>;
export declare function resetPassword(username: string): Promise<void>;
export declare function ensureDefaultAdminAccount(): Promise<void>;
//# sourceMappingURL=authService.d.ts.map