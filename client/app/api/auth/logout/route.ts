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

async function handleLogout(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value || "";
  const sessionId = request.cookies.get(AUTH_SESSION_COOKIE)?.value || "";

  if (token && sessionId) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-session-id": sessionId,
        },
        cache: "no-store",
      });
    } catch {
      // Always clear client cookies even if server logout fails.
    }
  }

  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);
  clearAuthCookies(response);
  return response;
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}
