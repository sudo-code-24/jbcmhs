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
    console.info(`[push] subscribe saved; total subscribers=${(0, push_store_1.getAllSubscriptions)().length} endpoint≈${subscription.endpoint.slice(0, 56)}…`);
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
        console.info("[push] notifyAll: 0 subscribers — open the site, tap the bell, and confirm the same API URL handles /api/push/subscribe and creates announcements (see server logs on subscribe).");
        return;
    }
    console.info(`[push] notifyAll: sending "${payload.title}" to ${subs.length} subscriber(s)`);
    await Promise.all(subs.map(async (sub) => {
        try {
            await (0, exports.sendNotification)(sub, payload);
        }
        catch (err) {
            if (isExpiredSubscriptionError(err)) {
                (0, push_store_1.removeSubscription)(sub.endpoint);
                return;
            }
            console.warn("[push] send failed:", sub.endpoint.slice(0, 64), err);
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