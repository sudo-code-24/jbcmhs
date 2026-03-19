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
  role?: string;
};

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = (req.body ?? {}) as AuthPayload;
    const username = String(payload.username ?? "").trim();
    const email = String(payload.email ?? "").trim();
    const password = String(payload.password ?? "").trim();
    const roleInput = String(payload.role ?? "faculty").trim().toLowerCase();

    if (!username || !password) {
      res.status(400).json({ error: "username and password are required" });
      return;
    }
    if (!authService.isValidRole(roleInput)) {
      res.status(400).json({ error: "role must be 'admin' or 'faculty'" });
      return;
    }

    const computedEmail = email || `${username}@jbcmhs.local`;
    const created = await authService.signup(computedEmail, password, username, roleInput as "admin" | "faculty");
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
          error: "Password must be updated before signing in",
        });
        return;
      }
      res.status(401).json({ success: false, error: "Invalid email or password" });
      return;
    }
    const user = await authService.getUserByIdentifier(identifier);
    const role = user?.role ?? "faculty";
    const token = signAuthToken(result.userEmail, role);
    const expiresIn = getJwtExpiresInSeconds();
    const expiresAt = Date.now() + expiresIn * 1000;
    const session = await createSession({
      userEmail: result.userEmail,
      jwtToken: token,
      expiresAt,
    });

    res.json({
      success: true,
      token,
      sessionId: session.sessionId,
      expiresAt,
      user: { email: result.userEmail, role },
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

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authReq = req as Request & { user?: { email: string } };
    const email = authReq.user?.email;
    if (!email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await authService.getUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ email: user.email, username: user.username, role: user.role });
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
    await revokeSession(authReq.user.sessionId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
