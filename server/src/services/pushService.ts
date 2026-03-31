import { getAllSubscriptions, removeSubscription, saveSubscription } from "../lib/push.store";
import {
  PushSubscriptionPayload,
  NotificationPayload,
} from "../types/push.types";
import webpush from "../lib/webpush";

export const subscribeClient = (subscription: PushSubscriptionPayload) => {
  saveSubscription(subscription);
  console.info(
    `[push] subscribe saved; total subscribers=${getAllSubscriptions().length} endpoint≈${subscription.endpoint.slice(0, 56)}…`,
  );
};

export const sendNotification = async (
  subscription: PushSubscriptionPayload,
  payload: NotificationPayload,
) => {
  return webpush.sendNotification(subscription, JSON.stringify(payload), {
    TTL: 86_400,
    urgency: "high",
  });
};

const isExpiredSubscriptionError = (err: unknown): boolean => {
  const code = (err as { statusCode?: number })?.statusCode;
  return code === 404 || code === 410;
};

export const notifyAll = async (payload: NotificationPayload) => {
  const subs = getAllSubscriptions();
  if (subs.length === 0) {
    console.info(
      "[push] notifyAll: 0 subscribers — open the site, tap the bell, and confirm the same API URL handles /api/push/subscribe and creates announcements (see server logs on subscribe).",
    );
    return;
  }
  console.info(`[push] notifyAll: sending "${payload.title}" to ${subs.length} subscriber(s)`);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await sendNotification(sub, payload);
      } catch (err) {
        if (isExpiredSubscriptionError(err)) {
          removeSubscription(sub.endpoint);
          return;
        }
        console.warn("[push] send failed:", sub.endpoint.slice(0, 64), err);
      }
    }),
  );
};

export const broadcastNewAnnouncement = (title: string) => {
  void notifyAll({
    title: "New announcement",
    body: title,
    url: "/announcements",
  });
};

export const broadcastNewEvent = (title: string) => {
  void notifyAll({
    title: "New calendar event",
    body: title,
    url: "/calendar",
  });
};
