import { NextRequest, NextResponse } from "next/server";
import { cookieMaxAgeSecondsFromJwt, STRAPI_JWT_COOKIE } from "@/lib/auth/strapiSession";
import { shouldUseSecureCookie } from "@/lib/auth/requestCookieSecure";
import { getStrapiUrl } from "@/lib/strapi/config";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

type StrapiAuthResponse = {
  jwt?: string;
  user?: { id?: number; email?: string; username?: string };
  error?: { message?: string };
  data?: { jwt?: string; user?: unknown };
};

function extractAuthJwt(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const o = body as Record<string, unknown>;
  if (typeof o.jwt === "string" && o.jwt.length > 0) return o.jwt;
  const nested = o.data;
  if (nested && typeof nested === "object" && typeof (nested as Record<string, unknown>).jwt === "string") {
    const j = (nested as Record<string, unknown>).jwt;
    return typeof j === "string" && j.length > 0 ? j : undefined;
  }
  return undefined;
}

function getStrapiBase(): string {
  try {
    return getStrapiUrl();
  } catch {
    throw new Error("STRAPI_URL is not configured");
  }
}

export async function POST(request: NextRequest) {
  let body: LoginRequestBody;
  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const rawIdentifier = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  if (!rawIdentifier || !password) {
    return NextResponse.json({ error: "Email or username and password are required" }, { status: 400 });
  }

  /** Strapi matches email case-insensitively; username is case-sensitive in DB. */
  const identifier = rawIdentifier.includes("@") ? rawIdentifier.toLowerCase() : rawIdentifier;

  let authResponse: Response;
  try {
    authResponse = await fetch(`${getStrapiBase()}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Authentication service is unavailable" }, { status: 503 });
  }

  const authData = (await authResponse.json().catch(() => null)) as StrapiAuthResponse | null;
  if (!authResponse.ok) {
    const msg =
      authData?.error?.message ||
      (typeof authData === "object" && authData && "message" in authData
        ? String((authData as { message?: string }).message)
        : null) ||
      "Invalid credentials";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const jwt = extractAuthJwt(authData);
  if (!jwt) {
    return NextResponse.json({ error: "Invalid authentication response" }, { status: 502 });
  }

  const maxAge = cookieMaxAgeSecondsFromJwt(jwt);
  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: STRAPI_JWT_COOKIE,
    value: jwt,
    httpOnly: true,
    secure: shouldUseSecureCookie(request),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
