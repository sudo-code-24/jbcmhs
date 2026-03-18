import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  getAdminSessionTokenValue,
  isAdminConfigValid,
} from "@/lib/adminAuth";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

type ServerLoginResponse = {
  success?: boolean;
  requiresPasswordChange?: boolean;
  error?: string;
  token?: string;
  sessionId?: string;
  expiresAt?: number;
};

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

export async function POST(request: Request) {
  if (!isAdminConfigValid()) {
    return NextResponse.json(
      { error: "Admin auth is not configured. Set ADMIN_SESSION_TOKEN." },
      { status: 500 }
    );
  }

  let body: LoginRequestBody;
  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  let authResponse: Response;
  try {
    authResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Authentication service is unavailable" }, { status: 503 });
  }

  const authData = (await authResponse.json().catch(() => null)) as ServerLoginResponse | null;
  if (!authResponse.ok) {
    if (authData?.requiresPasswordChange) {
      return NextResponse.json(
        {
          error: authData.error || "Default password must be changed before signing in",
          requiresPasswordChange: true,
        },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: authData?.error || "Invalid credentials" }, { status: 401 });
  }

  if (!authData?.token || !authData?.sessionId || !authData?.expiresAt) {
    return NextResponse.json({ error: "Invalid authentication response" }, { status: 502 });
  }

  const response = NextResponse.json({ success: true });
  const maxAge = Math.max(1, Math.floor((authData.expiresAt - Date.now()) / 1000));
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: getAdminSessionTokenValue(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  response.cookies.set({
    name: AUTH_TOKEN_COOKIE,
    value: authData.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  response.cookies.set({
    name: AUTH_SESSION_COOKIE,
    value: authData.sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return response;
}
