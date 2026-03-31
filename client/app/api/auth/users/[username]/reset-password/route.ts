import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_AUTH_COOKIE,
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  isValidAdminSessionCookie,
} from "@/lib/adminAuth";
import { getServerBackendUrl } from "@/lib/serverBackendUrl";

const API_URL = getServerBackendUrl();

function ensureAdminAccess(): NextResponse | null {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value || "";
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value || "";
  if (!isValidAdminSessionCookie(sessionCookie) || !token || !sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

type Params = {
  params: { username: string };
};

export async function POST(_request: Request, { params }: Params) {
  const unauthorized = ensureAdminAccess();
  if (unauthorized) return unauthorized;
  const token = cookies().get(AUTH_TOKEN_COOKIE)?.value || "";
  const sessionId = cookies().get(AUTH_SESSION_COOKIE)?.value || "";

  const username = decodeURIComponent(params.username || "").trim();
  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/auth/users/${encodeURIComponent(username)}/reset-password`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-session-id": sessionId,
      },
    });
  } catch {
    return NextResponse.json({ error: "Authentication service is unavailable" }, { status: 503 });
  }

  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    return NextResponse.json({ error: data?.error || "Reset password failed" }, { status: response.status });
  }
  return NextResponse.json({ success: true });
}
