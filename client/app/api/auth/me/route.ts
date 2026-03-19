import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_AUTH_COOKIE,
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  isValidAdminSessionCookie,
} from "@/lib/adminAuth";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://jbcmhs.onrender.com";

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value || "";
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value || "";
  if (!isValidAdminSessionCookie(sessionCookie) || !token || !sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-session-id": sessionId,
      },
    });
    const data = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      const message = (data as { error?: string } | null)?.error || "Unable to load user";
      return NextResponse.json({ error: message }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Authentication service is unavailable" },
      { status: 503 }
    );
  }
}
