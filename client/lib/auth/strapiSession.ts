import { decodeJwt, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  STRAPI_JWT_COOKIE,
  verifyStrapiJwt,
  verifyStrapiJwtEdge,
} from "@/lib/auth/strapiJwtVerify";
import { flattenStrapiEntity } from "@/lib/strapi/flatten";

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

function flattenStrapiRelation(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  if (r.data !== null && typeof r.data === "object" && !Array.isArray(r.data)) {
    return flattenStrapiEntity(r.data);
  }
  return flattenStrapiEntity(raw);
}

function parseStrapiUserBody(body: unknown): StrapiMeUser | null {
  if (!body || typeof body !== "object") return null;
  const top = body as Record<string, unknown>;
  const wrapped =
    top.data !== undefined && top.data !== null && typeof top.data === "object" && !Array.isArray(top.data)
      ? top.data
      : top;
  const ent = flattenStrapiEntity(wrapped);
  const id = typeof ent.id === "number" ? ent.id : undefined;
  const documentId = typeof ent.documentId === "string" ? ent.documentId : undefined;
  const username = typeof ent.username === "string" ? ent.username : undefined;
  const email = typeof ent.email === "string" ? ent.email : undefined;
  const roleRaw = ent.role;
  let role: StrapiMeUser["role"] | undefined;
  if (typeof roleRaw === "number") {
    role = { id: roleRaw };
  } else if (roleRaw !== undefined && roleRaw !== null) {
    const rr = flattenStrapiRelation(roleRaw);
    role = {
      id: typeof rr.id === "number" ? rr.id : undefined,
      name: typeof rr.name === "string" ? rr.name : undefined,
      type: typeof rr.type === "string" ? rr.type : undefined,
    };
  }

  return { id, documentId, username, email, role };
}

function userIdFromStrapiJwt(jwt: string): number | undefined {
  try {
    const id = decodeJwt(jwt).id;
    return typeof id === "number" ? id : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Loads the signed-in Users & Permissions user. `/users/me` often omits populated `role`
 * or returns wrapped shapes; we normalize JSON and retry `GET /users/:id?populate=role`
 * when the role name is still missing (see strapi/strapi#13296).
 */
export async function fetchStrapiMe(jwt: string): Promise<StrapiMeUser | null> {
  const base = process.env.STRAPI_URL?.replace(/\/$/, "");
  if (!base) return null;
  const headers = { Authorization: `Bearer ${jwt}` };

  const res = await fetch(`${base}/api/users/me?populate=role`, {
    cache: "no-store",
    headers,
  });
  if (!res.ok) return null;
  let user = parseStrapiUserBody(await res.json().catch(() => null));
  if (!user) return null;

  const needsRoleName = !user.role?.name?.trim();
  const uid = user.id ?? userIdFromStrapiJwt(jwt);
  if (needsRoleName && uid != null) {
    const res2 = await fetch(`${base}/api/users/${uid}?populate=role`, {
      cache: "no-store",
      headers,
    });
    if (res2.ok) {
      const u2 = parseStrapiUserBody(await res2.json().catch(() => null));
      if (u2?.role?.name) {
        user = { ...user, role: { ...user.role, ...u2.role } };
      }
    }
  }

  return user;
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
