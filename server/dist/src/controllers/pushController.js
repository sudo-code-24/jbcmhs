"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribe = exports.getVapidPublicKey = void 0;
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
//# sourceMappingURL=pushController.js.map