"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const googleDrive_1 = require("../lib/googleDrive");
const router = (0, express_1.Router)();
const IMAGE_CACHE_TTL_MS = Number(process.env.IMAGE_CACHE_TTL_MS || 10 * 60 * 1000);
const IMAGE_CACHE_MAX_ENTRIES = Number(process.env.IMAGE_CACHE_MAX_ENTRIES || 200);
const BROWSER_MAX_AGE_SECONDS = Math.max(60, Math.floor(IMAGE_CACHE_TTL_MS / 1000));
const STALE_WHILE_REVALIDATE_SECONDS = Number(process.env.IMAGE_CACHE_STALE_SECONDS || 60 * 60 * 24);
const IMAGE_FETCH_TIMEOUT_MS = Number(process.env.IMAGE_FETCH_TIMEOUT_MS || 15000);
const cache = new Map();
const inFlight = new Map();
function enforceCacheSizeLimit() {
    while (cache.size > IMAGE_CACHE_MAX_ENTRIES) {
        const firstKey = cache.keys().next().value;
        if (!firstKey)
            break;
        cache.delete(firstKey);
    }
}
function buildEtag(cacheKey, body) {
    const digest = crypto_1.default
        .createHash("sha1")
        .update(cacheKey)
        .update(body)
        .digest("base64url");
    return `"${digest}"`;
}
function getCacheKey(fileId, size) {
    return `${fileId}:${size}`;
}
async function fetchImageFromDrive(fileId, size) {
    const upstreamUrl = (0, googleDrive_1.toDriveThumbnailUrl)(fileId, size);
    if (!upstreamUrl) {
        throw new Error("Invalid Drive file id");
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
    try {
        const response = await fetch(upstreamUrl, { signal: controller.signal });
        if (!response.ok) {
            const err = new Error(`Failed to fetch image: ${response.status}`);
            err.status = response.status;
            throw err;
        }
        const arrayBuffer = await response.arrayBuffer();
        const body = Buffer.from(arrayBuffer);
        const contentType = response.headers.get("content-type") || "image/jpeg";
        const now = Date.now();
        return {
            body,
            contentType,
            etag: buildEtag(getCacheKey(fileId, size), body),
            expiresAt: now + IMAGE_CACHE_TTL_MS,
            lastUpdatedAt: now,
        };
    }
    finally {
        clearTimeout(timeout);
    }
}
async function getCachedOrFetch(fileId, size) {
    const cacheKey = getCacheKey(fileId, size);
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
        return cached;
    }
    const currentPromise = inFlight.get(cacheKey);
    if (currentPromise) {
        return currentPromise;
    }
    const requestPromise = fetchImageFromDrive(fileId, size)
        .then((entry) => {
        cache.set(cacheKey, entry);
        enforceCacheSizeLimit();
        return entry;
    })
        .finally(() => {
        inFlight.delete(cacheKey);
    });
    inFlight.set(cacheKey, requestPromise);
    try {
        return await requestPromise;
    }
    catch (error) {
        if (cached) {
            return cached;
        }
        throw error;
    }
}
router.get("/:fileId", async (req, res, next) => {
    try {
        const fileId = (0, googleDrive_1.extractDriveFileId)(req.params.fileId);
        if (!fileId) {
            res.status(400).json({ error: "Missing file id" });
            return;
        }
        const sizeParam = typeof req.query.sz === "string" && req.query.sz.trim() ? req.query.sz.trim() : "w2000";
        const entry = await getCachedOrFetch(fileId, sizeParam);
        if (req.headers["if-none-match"] === entry.etag) {
            res.status(304).end();
            return;
        }
        res.setHeader("Content-Type", entry.contentType);
        res.setHeader("Cache-Control", `public, max-age=${BROWSER_MAX_AGE_SECONDS}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`);
        res.setHeader("ETag", entry.etag);
        res.setHeader("Last-Modified", new Date(entry.lastUpdatedAt).toUTCString());
        res.send(entry.body);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=images.js.map