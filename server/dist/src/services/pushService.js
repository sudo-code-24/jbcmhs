"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastNewEvent = exports.broadcastNewAnnouncement = exports.notifyAll = exports.sendNotification = exports.subscribeClient = void 0;
const push_store_1 = require("../lib/push.store");
const webpush_1 = __importDefault(require("../lib/webpush"));
const subscribeClient = (subscription) => {
    (0, push_store_1.saveSubscription)(subscription);
};
exports.subscribeClient = subscribeClient;
const sendNotification = async (subscription, payload) => {
    return webpush_1.default.sendNotification(subscription, JSON.stringify(payload), {
        TTL: 86400,
        urgency: "high",
    });
};
exports.sendNotification = sendNotification;
const isExpiredSubscriptionError = (err) => {
    const code = err?.statusCode;
    return code === 404 || code === 410;
};
const notifyAll = async (payload) => {
    const subs = (0, push_store_1.getAllSubscriptions)();
    if (subs.length === 0) {
        console.info("[push] notifyAll: no active subscriptions (users must enable Alerts and server must stay up)");
        return;
    }
    await Promise.all(subs.map(async (sub) => {
        try {
            await (0, exports.sendNotification)(sub, payload);
        }
        catch (err) {
            if (isExpiredSubscriptionError(err)) {
                (0, push_store_1.removeSubscription)(sub.endpoint);
                return;
            }
            console.warn("Push send failed:", err);
        }
    }));
};
exports.notifyAll = notifyAll;
const broadcastNewAnnouncement = (title) => {
    void (0, exports.notifyAll)({
        title: "New announcement",
        body: title,
        url: "/announcements",
    });
};
exports.broadcastNewAnnouncement = broadcastNewAnnouncement;
const broadcastNewEvent = (title) => {
    void (0, exports.notifyAll)({
        title: "New calendar event",
        body: title,
        url: "/calendar",
    });
};
exports.broadcastNewEvent = broadcastNewEvent;
//# sourceMappingURL=pushService.js.map