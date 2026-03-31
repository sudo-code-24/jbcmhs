"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleClients_1 = require("./googleClients");
const web_push_1 = __importDefault(require("web-push"));
const vapidSubject = process.env.VAPID_SUBJECT?.trim() || "mailto:admin@localhost";
web_push_1.default.setVapidDetails(vapidSubject, (0, googleClients_1.requiredEnv)("VAPID_PUBLIC_KEY"), (0, googleClients_1.requiredEnv)("VAPID_PRIVATE_KEY"));
exports.default = web_push_1.default;
//# sourceMappingURL=webpush.js.map