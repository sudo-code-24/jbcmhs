import { getStrapiToken, getStrapiUrl } from "./config";

type StrapiFetchInit = RequestInit & { next?: { revalidate?: number } };

/**
 * Calls Strapi's REST API. On the server, sends `Authorization: Bearer STRAPI_API_TOKEN`.
 * In the browser, same-origin `/api/strapi-proxy/...` forwards the request with the token.
 */
export async function strapiFetch(apiPathWithQuery: string, init: StrapiFetchInit = {}): Promise<Response> {
  const isBrowser = typeof window !== "undefined";
  const normalized = apiPathWithQuery.startsWith("/api/") ? apiPathWithQuery : `/api/${apiPathWithQuery}`;
  let url: string;
  if (isBrowser) {
    const qIndex = normalized.indexOf("?");
    const pathOnly = qIndex === -1 ? normalized : normalized.slice(0, qIndex);
    const query = qIndex === -1 ? "" : normalized.slice(qIndex);
    const rest = pathOnly.replace(/^\/api\/?/, "");
    url = `/api/strapi-proxy/${rest}${query}`;
  } else {
    url = `${getStrapiUrl()}${normalized}`;
  }

  const headers = new Headers(init.headers);
  if (!isBrowser) {
    headers.set("Authorization", `Bearer ${getStrapiToken()}`);
  }

  return fetch(url, { ...init, headers });
}

export async function strapiFetchJson<T>(apiPathWithQuery: string, init: StrapiFetchInit = {}): Promise<T> {
  const res = await strapiFetch(apiPathWithQuery, init);
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(text || res.statusText || "Strapi request failed") as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}
