import { NextFunction, Request, Response } from "express";
export declare function signup(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function me(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listUsers(_req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function logout(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=authController.d.ts.map