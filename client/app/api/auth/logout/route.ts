import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE, AUTH_SESSION_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/adminAuth";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://jbcmhs.onrender.com";

function clearAuthCookies(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: AUTH_TOKEN_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: AUTH_SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
}

async function handleLogout(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value || "";
    const sessionId = request.cookies.get(AUTH_SESSION_COOKIE)?.value || "";

    if (token && sessionId) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "x-session-id": sessionId,
          },
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch {
        // Always clear client cookies even if backend logout fails or times out.
      }
    }

    const baseUrl = request.nextUrl?.origin || request.url;
    const loginUrl = new URL("/login", baseUrl);
    const response = NextResponse.redirect(loginUrl);
    clearAuthCookies(response);
    return response;
  } catch {
    // Fallback: redirect to login even if something unexpected fails (e.g. serverless edge cases)
    const fallbackUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/login`
      : process.env.URL || "https://main--jbcmhs.netlify.app/login";
    const response = NextResponse.redirect(fallbackUrl);
    clearAuthCookies(response);
    return response;
  }
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}
