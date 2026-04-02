import { NextRequest, NextResponse } from "next/server";
import { STRAPI_JWT_COOKIE } from "@/lib/auth/strapiJwtVerify";
import { shouldUseSecureCookie } from "@/lib/auth/requestCookieSecure";
import { LEGACY_ADMIN_AUTH_COOKIE, LEGACY_AUTH_SESSION_COOKIE, LEGACY_AUTH_TOKEN_COOKIE } from "@/lib/adminAuth";

const SITE_URL =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://jbcmhs.netlify.app";

function clearAllAuthCookies(response: NextResponse, request: NextRequest) {
  const secure = shouldUseSecureCookie(request);
  const names = [
    STRAPI_JWT_COOKIE,
    LEGACY_ADMIN_AUTH_COOKIE,
    LEGACY_AUTH_TOKEN_COOKIE,
    LEGACY_AUTH_SESSION_COOKIE,
  ];
  for (const name of names) {
    response.cookies.set({
      name,
      value: "",
      path: "/",
      maxAge: 0,
      secure,
      sameSite: "lax",
      ...(name === STRAPI_JWT_COOKIE ? { httpOnly: true as const } : {}),
    });
  }
}

async function handleLogout(request: NextRequest): Promise<NextResponse> {
  try {
    const baseUrl = request.nextUrl?.origin || request.url;
    const response = NextResponse.redirect(baseUrl);
    clearAllAuthCookies(response, request);
    return response;
  } catch {
    const fallbackUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/`
      : process.env.URL || `${SITE_URL}/`;
    const response = NextResponse.redirect(fallbackUrl);
    clearAllAuthCookies(response, request);
    return response;
  }
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}
