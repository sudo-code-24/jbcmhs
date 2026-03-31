import { Request, Response } from "express";
export declare const getVapidPublicKey: (_req: Request, res: Response) => Response<any, Record<string, any>>;
export declare const subscribe: (req: Request, res: Response) => Response<any, Record<string, any>>;
/** GET — subscriber count for debugging (no secrets). */
export declare const getStatus: (_req: Request, res: Response) => void;
/**
 * POST — send a test notification to all subscribers.
 * Requires: `Authorization: Bearer <PUSH_TEST_SECRET>` and env `PUSH_TEST_SECRET` on the API server.
 */
export declare const postTestNotification: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=pushController.d.ts.map