import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_AUTH_COOKIE,
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_COOKIE,
  isValidAdminSessionCookie,
} from "@/lib/adminAuth";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://jbcmhs.onrender.com";

type SignupRequestBody = {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
};

export async function POST(request: Request) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value || "";
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value || "";
  if (!isValidAdminSessionCookie(sessionCookie) || !token || !sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SignupRequestBody;
  try {
    body = (await request.json()) as SignupRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username = String(body.username ?? "").trim();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const role = String(body.role ?? "faculty").trim().toLowerCase();
  if (!username || !password) {
    return NextResponse.json({ error: "username and password are required" }, { status: 400 });
  }
  if (role !== "admin" && role !== "faculty") {
    return NextResponse.json({ error: "role must be 'admin' or 'faculty'" }, { status: 400 });
  }

  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-session-id": sessionId,
    },
    body: JSON.stringify({ username, email, password, role }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const message = (data as { error?: string } | null)?.error || "Sign up failed";
    return NextResponse.json({ error: message }, { status: response.status });
  }
  return NextResponse.json(data, { status: 201 });
}
