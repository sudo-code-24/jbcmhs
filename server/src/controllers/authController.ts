import { NextFunction, Request, Response } from "express";
import * as authService from "../services/authService";
import { getJwtExpiresInSeconds, signAuthToken } from "../lib/jwt";
import { createSession, revokeSession } from "../services/sessionService";

type AuthPayload = {
  username?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
  newPassword?: string;
};

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = (req.body ?? {}) as AuthPayload;
    const username = String(payload.username ?? "").trim();
    const email = String(payload.email ?? "").trim();
    const password = String(payload.password ?? "");

    if (!username || !password) {
      res.status(400).json({ error: "username and password are required" });
      return;
    }

    const computedEmail = email || `${username}@jbcmhs.local`;
    const created = await authService.signup(computedEmail, password, username);
    res.status(201).json({ success: true, user: created });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = (req.body ?? {}) as AuthPayload;
    const identifier = String(payload.email ?? payload.username ?? "").trim();
    const password = String(payload.password ?? "");
    if (!identifier || !password) {
      res.status(400).json({ success: false, error: "username/email and password are required" });
      return;
    }

    const result = await authService.login(identifier, password);
    if (!result.success) {
      if (result.requiresPasswordChange) {
        res.status(403).json({
          success: false,
          requiresPasswordChange: true,
          error: "Default password must be changed before signing in",
        });
        return;
      }
      res.status(401).json({ success: false, error: "Invalid email or password" });
      return;
    }
    const token = signAuthToken(result.userEmail);
    const expiresIn = getJwtExpiresInSeconds();
    const expiresAt = Date.now() + expiresIn * 1000;
    const session = createSession({
      userEmail: result.userEmail,
      jwtToken: token,
      expiresAt,
    });

    res.json({
      success: true,
      token,
      sessionId: session.sessionId,
      expiresAt,
      user: { email: result.userEmail },
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = (req.body ?? {}) as AuthPayload;
    const identifier = String(payload.email ?? payload.username ?? "").trim();
    const currentPassword = String(payload.currentPassword ?? "");
    const newPassword = String(payload.newPassword ?? "");

    if (!identifier || !currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: "username/email, currentPassword, and newPassword are required",
      });
      return;
    }

    await authService.changePassword(identifier, currentPassword, newPassword);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await authService.listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.deleteUser(req.params.username);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.resetPassword(req.params.username);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as Request & { user?: { sessionId: string } };
    if (!authReq.user?.sessionId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    revokeSession(authReq.user.sessionId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
