/** Strapi base URL (no trailing slash). Server-side only for writes; reads from the browser go through `/api/strapi-proxy`. */
export function getStrapiUrl(): string {
  const u = process.env.STRAPI_URL;
  if (!u) throw new Error("STRAPI_URL is not set");
  return u.replace(/\/$/, "");
}

export function getStrapiToken(): string {
  const t = process.env.STRAPI_API_TOKEN;
  if (!t) throw new Error("STRAPI_API_TOKEN is not set");
  return t;
}
