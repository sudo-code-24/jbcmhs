import { Router } from "express";
import crypto from "crypto";
import { extractDriveFileId, toDriveThumbnailUrl } from "../lib/googleDrive";

type CacheEntry = {
  body: Buffer;
  contentType: string;
  etag: string;
  expiresAt: number;
  lastUpdatedAt: number;
};

const router = Router();

const IMAGE_CACHE_TTL_MS = Number(process.env.IMAGE_CACHE_TTL_MS || 10 * 60 * 1000);
const IMAGE_CACHE_MAX_ENTRIES = Number(process.env.IMAGE_CACHE_MAX_ENTRIES || 200);
const BROWSER_MAX_AGE_SECONDS = Math.max(60, Math.floor(IMAGE_CACHE_TTL_MS / 1000));
const STALE_WHILE_REVALIDATE_SECONDS = Number(process.env.IMAGE_CACHE_STALE_SECONDS || 60 * 60 * 24);
const IMAGE_FETCH_TIMEOUT_MS = Number(process.env.IMAGE_FETCH_TIMEOUT_MS || 15000);

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<CacheEntry>>();

function enforceCacheSizeLimit(): void {
  while (cache.size > IMAGE_CACHE_MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (!firstKey) break;
    cache.delete(firstKey);
  }
}

function buildEtag(cacheKey: string, body: Buffer): string {
  const digest = crypto
    .createHash("sha1")
    .update(cacheKey)
    .update(body)
    .digest("base64url");
  return `"${digest}"`;
}

function getCacheKey(fileId: string, size: string): string {
  return `${fileId}:${size}`;
}

async function fetchImageFromDrive(fileId: string, size: string): Promise<CacheEntry> {
  const upstreamUrl = toDriveThumbnailUrl(fileId, size);
  if (!upstreamUrl) {
    throw new Error("Invalid Drive file id");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(upstreamUrl, { signal: controller.signal });
    if (!response.ok) {
      const err = new Error(`Failed to fetch image: ${response.status}`) as Error & { status?: number };
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
  } finally {
    clearTimeout(timeout);
  }
}

async function getCachedOrFetch(fileId: string, size: string): Promise<CacheEntry> {
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
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw error;
  }
}

router.get("/:fileId", async (req, res, next) => {
  try {
    const fileId = extractDriveFileId(req.params.fileId);
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
  } catch (error) {
    next(error);
  }
});

export default router;
