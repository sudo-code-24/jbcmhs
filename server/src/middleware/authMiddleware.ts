import { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "../lib/jwt";
import { getSession, isSessionValid } from "../services/sessionService";

function getBearerToken(authorizationHeader: string | undefined): string {
  if (!authorizationHeader) return "";
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return "";
  return token.trim();
}

function getCookieValue(cookieHeader: string | undefined, key: string): string {
  if (!cookieHeader) return "";
  const pairs = cookieHeader.split(";").map((part) => part.trim());
  for (const pair of pairs) {
    const [name, ...valueParts] = pair.split("=");
    if (name === key) {
      return decodeURIComponent(valueParts.join("=") || "");
    }
  }
  return "";
}

function getSessionId(req: Request): string {
  const fromHeader = String(req.headers["x-session-id"] ?? "").trim();
  if (fromHeader) return fromHeader;
  const fromCookie = getCookieValue(req.headers.cookie, "sessionId");
  return fromCookie.trim();
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = getBearerToken(req.header("authorization"));
    const sessionId = getSessionId(req);
    if (!token || !sessionId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const payload = verifyAuthToken(token);
    const session = await getSession(sessionId);
    if (!isSessionValid(session)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!session || session.jwtToken !== token || session.userEmail !== payload.email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const authReq = req as Request & { user?: { email: string; sessionId: string } };
    authReq.user = {
      email: payload.email,
      sessionId: session.sessionId,
    };
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
