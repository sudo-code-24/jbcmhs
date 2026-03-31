import { PushSubscriptionPayload, NotificationPayload } from "../types/push.types";
import webpush from "../lib/webpush";
export declare const subscribeClient: (subscription: PushSubscriptionPayload) => void;
export declare const sendNotification: (subscription: PushSubscriptionPayload, payload: NotificationPayload) => Promise<webpush.SendResult>;
export declare const notifyAll: (payload: NotificationPayload) => Promise<void>;
export declare const broadcastNewAnnouncement: (title: string) => void;
export declare const broadcastNewEvent: (title: string) => void;
//# sourceMappingURL=pushService.d.ts.map