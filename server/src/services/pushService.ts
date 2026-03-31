import { getAllSubscriptions, removeSubscription, saveSubscription } from "../lib/push.store";
import {
  PushSubscriptionPayload,
  NotificationPayload,
} from "../types/push.types";
import webpush from "../lib/webpush";

export const subscribeClient = (subscription: PushSubscriptionPayload) => {
  saveSubscription(subscription);
};

export const sendNotification = async (
  subscription: PushSubscriptionPayload,
  payload: NotificationPayload,
) => {
  return webpush.sendNotification(subscription, JSON.stringify(payload));
};

const isExpiredSubscriptionError = (err: unknown): boolean => {
  const code = (err as { statusCode?: number })?.statusCode;
  return code === 404 || code === 410;
};

export const notifyAll = async (payload: NotificationPayload) => {
  const subs = getAllSubscriptions();
  if (subs.length === 0) {
    console.info("[push] notifyAll: no active subscriptions (users must enable Alerts and server must stay up)");
    return;
  }
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await sendNotification(sub, payload);
      } catch (err) {
        if (isExpiredSubscriptionError(err)) {
          removeSubscription(sub.endpoint);
          return;
        }
        console.warn("Push send failed:", err);
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
