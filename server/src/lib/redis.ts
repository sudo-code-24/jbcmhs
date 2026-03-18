import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";

let warnLogged = false;

export function getRedisClient(): Redis | null {
  if (!redisUrl || !redisToken) {
    if (!warnLogged) {
      warnLogged = true;
      console.warn("Upstash Redis env vars missing. Falling back to in-memory sessions.");
    }
    return null;
  }
  return new Redis({
    url: redisUrl,
    token: redisToken,
  });
}
