import { PushSubscriptionPayload } from "../types/push.types";

/** Keyed by Push endpoint so browsers can (re)subscribe without a separate user id. */
const subscriptions = new Map<string, PushSubscriptionPayload>();

export const saveSubscription = (subscription: PushSubscriptionPayload) => {
  subscriptions.set(subscription.endpoint, subscription);
};

export const removeSubscription = (endpoint: string) => {
  subscriptions.delete(endpoint);
};

export const getAllSubscriptions = () => {
  return Array.from(subscriptions.values());
};
