import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  isValidAdminSessionCookie,
} from "@/lib/adminAuth";
import { cookies } from "next/headers";
import { getServerBackendUrl } from "@/lib/serverBackendUrl";

const API_URL = getServerBackendUrl();

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = ensureAuth();
  if (auth instanceof NextResponse) return auth;
  const { token, sessionId } = auth;
  const { id } = await params;

  const body = await request.text();
  const response = await fetch(`${API_URL}/api/events/${id}`, {
    method: "PUT",
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = ensureAuth();
  if (auth instanceof NextResponse) return auth;
  const { token, sessionId } = auth;
  const { id } = await params;

  const response = await fetch(`${API_URL}/api/events/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-session-id": sessionId,
    },
    cache: "no-store",
  });
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  const data = (await response.json().catch(() => null)) as unknown;
  return NextResponse.json(
    data ?? { error: "Request failed" },
    { status: response.status }
  );
}
