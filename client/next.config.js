/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  /** In dev, a service worker + `/api/*` caching breaks cookie session routes (e.g. GET /api/auth/me). */
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    ...require("next-pwa/cache"),

    {
      urlPattern: /^https:\/\/jbcmhs\.onrender\.com\/.*/i,
      handler: "NetworkFirst",
      method: "GET",
      options: {
        cacheName: "jbcmhs-api-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      /** Never let the SW own auth API GETs — cookies must reach Next unchanged. */
      urlPattern: /\/api\/(?!auth\/)/i,
      handler: "NetworkFirst",
      method: "GET",
      options: {
        cacheName: "local-api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],

  fallbacks: {
    document: "/_offline",
  },
});

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  /** Proxy Strapi uploads so `/uploads/*` works when media URLs are relative (no NEXT_PUBLIC Strapi URL). */
  async rewrites() {
    const raw = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "";
    const base = raw.replace(/\/$/, "");
    if (!base) return [];
    return [{ source: "/uploads/:path*", destination: `${base}/uploads/:path*` }];
  },
};

module.exports = withPWA(nextConfig);
