import { Request, Response } from "express";
import { subscribeClient } from "../services/pushService";
import { PushSubscriptionPayload } from "../types/push.types";

function isValidSubscription(body: unknown): body is PushSubscriptionPayload {
  if (!body || typeof body !== "object") return false;
  const s = body as Record<string, unknown>;
  if (typeof s.endpoint !== "string" || !s.endpoint) return false;
  if (!s.keys || typeof s.keys !== "object") return false;
  const keys = s.keys as Record<string, unknown>;
  return typeof keys.p256dh === "string" && typeof keys.auth === "string";
}

export const getVapidPublicKey = (_req: Request, res: Response) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  if (!publicKey) {
    return res.status(503).json({ error: "Push is not configured" });
  }
  return res.json({ publicKey });
};

export const subscribe = (req: Request, res: Response) => {
  const raw = req.body?.subscription;
  if (!isValidSubscription(raw)) {
    return res.status(400).json({ error: "Invalid subscription payload" });
  }
  subscribeClient(raw);
  return res.status(201).json({ ok: true });
};
