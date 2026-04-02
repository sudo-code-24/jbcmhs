/** Same-origin proxy for Strapi `/uploads/*` when the browser has no public CMS base URL. */
export const STRAPI_MEDIA_PROXY_PREFIX = "/api/strapi-media";

/**
 * Absolute URL for Strapi upload files. Prefer `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_STRAPI_URL`
 * so `<img>` hits the CMS host directly.
 *
 * If those are unset, relative paths are served through {@link STRAPI_MEDIA_PROXY_PREFIX}
 * (server uses `STRAPI_URL` / `NEXT_PUBLIC_STRAPI_URL` / `NEXT_PUBLIC_API_URL`).
 */
export function publicStrapiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "";
  return base.replace(/\/$/, "");
}

/** Resolve Strapi `image.url` (often `/uploads/...`) for `<img src>`. */
export function strapiMediaFullUrl(relativeUrl?: string | null): string | undefined {
  if (relativeUrl == null) return undefined;
  const t = String(relativeUrl).trim();
  if (!t) return undefined;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  const base = publicStrapiBaseUrl();
  if (base) {
    return `${base}${t.startsWith("/") ? "" : "/"}${t}`;
  }
  const path = t.replace(/^\//, "");
  return `${STRAPI_MEDIA_PROXY_PREFIX}/${path}`;
}
