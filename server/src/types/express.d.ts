export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        sessionId: string;
      };
    }
  }
}
