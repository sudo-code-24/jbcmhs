"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postTestNotification = exports.getStatus = exports.subscribe = exports.getVapidPublicKey = void 0;
const push_store_1 = require("../lib/push.store");
const pushService_1 = require("../services/pushService");
function isValidSubscription(body) {
    if (!body || typeof body !== "object")
        return false;
    const s = body;
    if (typeof s.endpoint !== "string" || !s.endpoint)
        return false;
    if (!s.keys || typeof s.keys !== "object")
        return false;
    const keys = s.keys;
    return typeof keys.p256dh === "string" && typeof keys.auth === "string";
}
const getVapidPublicKey = (_req, res) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
    if (!publicKey) {
        return res.status(503).json({ error: "Push is not configured" });
    }
    return res.json({ publicKey });
};
exports.getVapidPublicKey = getVapidPublicKey;
const subscribe = (req, res) => {
    const raw = req.body?.subscription;
    if (!isValidSubscription(raw)) {
        return res.status(400).json({ error: "Invalid subscription payload" });
    }
    (0, pushService_1.subscribeClient)(raw);
    return res.status(201).json({ ok: true });
};
exports.subscribe = subscribe;
/** GET — subscriber count for debugging (no secrets). */
const getStatus = (_req, res) => {
    const subscribers = (0, push_store_1.getAllSubscriptions)().length;
    const vapidConfigured = Boolean(process.env.VAPID_PUBLIC_KEY?.trim());
    res.json({ ok: true, subscribers, vapidConfigured });
};
exports.getStatus = getStatus;
/**
 * POST — send a test notification to all subscribers.
 * Requires: `Authorization: Bearer <PUSH_TEST_SECRET>` and env `PUSH_TEST_SECRET` on the API server.
 */
const postTestNotification = async (req, res) => {
    const secret = process.env.PUSH_TEST_SECRET?.trim();
    if (!secret) {
        return res.status(503).json({ error: "PUSH_TEST_SECRET is not set on the server" });
    }
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${secret}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const n = (0, push_store_1.getAllSubscriptions)().length;
    await (0, pushService_1.notifyAll)({
        title: "Test notification",
        body: "If you see this, push delivery is working.",
        url: "/",
    });
    return res.json({ ok: true, subscribers: n });
};
exports.postTestNotification = postTestNotification;
//# sourceMappingURL=pushController.js.map