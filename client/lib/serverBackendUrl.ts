/**
 * Base URL for the Express API when called from Next.js (Route Handlers, Server Components).
 *
 * - Set `API_URL` (preferred for server-only) or `NEXT_PUBLIC_API_URL` in production.
 * - In local dev, if neither is set, defaults to `http://127.0.0.1:5005` so push subscriptions
 *   and `notifyAll` hit the same backend as your `next dev` machine.
 * - Docker / custom host: set `LOCAL_API_URL` (e.g. `http://server:5005`).
 */
export function getServerBackendUrl(): string {
  const explicit =
    process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) return explicit;

  if (process.env.NODE_ENV !== "production") {
    return process.env.LOCAL_API_URL?.trim() || "http://127.0.0.1:5005";
  }

  return "https://jbcmhs.onrender.com";
}
