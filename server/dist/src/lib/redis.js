"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = getRedisClient;
const redis_1 = require("@upstash/redis");
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";
let warnLogged = false;
function getRedisClient() {
    if (!redisUrl || !redisToken) {
        if (!warnLogged) {
            warnLogged = true;
            console.warn("Upstash Redis env vars missing. Falling back to in-memory sessions.");
        }
        return null;
    }
    return new redis_1.Redis({
        url: redisUrl,
        token: redisToken,
    });
}
//# sourceMappingURL=redis.js.map