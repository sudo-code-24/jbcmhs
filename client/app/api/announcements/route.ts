import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  isValidAdminSessionCookie,
} from "@/lib/adminAuth";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://jbcmhs.onrender.com";

function ensureAuth(): { token: string; sessionId: string } | NextResponse {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value || "";
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value || "";
  const sessionCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  if (!isValidAdminSessionCookie(sessionCookie) || !token || !sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { token, sessionId };
}

export async function POST(request: NextRequest) {
  const auth = ensureAuth();
  if (auth instanceof NextResponse) return auth;
  const { token, sessionId } = auth;

  const body = await request.text();
  const response = await fetch(`${API_URL}/api/announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-session-id": sessionId,
    },
    body: body || undefined,
    cache: "no-store",
  });
  const data = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    return NextResponse.json(
      data ?? { error: "Request failed" },
      { status: response.status }
    );
  }
  return NextResponse.json(data);
}
