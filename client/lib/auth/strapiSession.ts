import { type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  STRAPI_JWT_COOKIE,
  verifyStrapiJwt,
  verifyStrapiJwtEdge,
} from "@/lib/auth/strapiJwtVerify";

export { STRAPI_JWT_COOKIE, verifyStrapiJwt, verifyStrapiJwtEdge };

export function cookieMaxAgeSecondsFromJwt(token: string): number {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return 60 * 60 * 24 * 7;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as {
      exp?: number;
    };
    if (!json.exp) return 60 * 60 * 24 * 7;
    return Math.max(60, json.exp - Math.floor(Date.now() / 1000));
  } catch {
    return 60 * 60 * 24 * 7;
  }
}

export type StrapiMeUser = {
  id?: number;
  documentId?: string;
  username?: string;
  email?: string;
  role?: { id?: number; name?: string; type?: string };
};

/** Map Strapi Users & Permissions role name → `admin` | `faculty` (see Strapi bootstrap). */
export function resolveAppRole(user: StrapiMeUser): "admin" | "faculty" {
  const n = user.role?.name?.toLowerCase().trim();
  if (n === "admin" || n === "administrator") return "admin";
  return "faculty";
}

export async function fetchStrapiMe(jwt: string): Promise<StrapiMeUser | null> {
  const base = process.env.STRAPI_URL?.replace(/\/$/, "");
  if (!base) return null;
  const res = await fetch(`${base}/api/users/me?populate=role`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) return null;
  const body = (await res.json().catch(() => null)) as StrapiMeUser | null;
  return body;
}

/** Valid JWT in cookie (verified). Pass `request` from Route Handlers when available. */
export async function requireStrapiJwt(
  request?: NextRequest,
): Promise<{ jwt: string; payload: JWTPayload } | NextResponse> {
  const jwt =
    request?.cookies.get(STRAPI_JWT_COOKIE)?.value ||
    cookies().get(STRAPI_JWT_COOKIE)?.value ||
    "";
  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await verifyStrapiJwt(jwt);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { jwt, payload };
}

export async function requireStrapiAdmin(
  request?: NextRequest,
): Promise<{ jwt: string } | NextResponse> {
  const auth = await requireStrapiJwt(request);
  if (auth instanceof NextResponse) return auth;
  const me = await fetchStrapiMe(auth.jwt);
  if (!me || resolveAppRole(me) !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { jwt: auth.jwt };
}
