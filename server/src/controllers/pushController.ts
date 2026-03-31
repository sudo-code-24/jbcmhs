import { Request, Response } from "express";
import { getAllSubscriptions } from "../lib/push.store";
import { notifyAll, subscribeClient } from "../services/pushService";
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

/** GET — subscriber count for debugging (no secrets). */
export const getStatus = (_req: Request, res: Response) => {
  const subscribers = getAllSubscriptions().length;
  const vapidConfigured = Boolean(process.env.VAPID_PUBLIC_KEY?.trim());
  res.json({ ok: true, subscribers, vapidConfigured });
};

/**
 * POST — send a test notification to all subscribers.
 * Requires: `Authorization: Bearer <PUSH_TEST_SECRET>` and env `PUSH_TEST_SECRET` on the API server.
 */
export const postTestNotification = async (req: Request, res: Response) => {
  const secret = process.env.PUSH_TEST_SECRET?.trim();
  if (!secret) {
    return res.status(503).json({ error: "PUSH_TEST_SECRET is not set on the server" });
  }
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const n = getAllSubscriptions().length;
  await notifyAll({
    title: "Test notification",
    body: "If you see this, push delivery is working.",
    url: "/",
  });
  return res.json({ ok: true, subscribers: n });
};
