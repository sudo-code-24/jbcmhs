import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  getAdminSessionTokenValue,
  isAdminConfigValid,
  validateAdminPassword,
} from "@/lib/adminAuth";

type LoginRequestBody = {
  password?: string;
};

export async function POST(request: Request) {
  if (!isAdminConfigValid()) {
    return NextResponse.json(
      { error: "Admin auth is not configured. Set ADMIN_PASSWORD (and optional ADMIN_SESSION_TOKEN)." },
      { status: 500 }
    );
  }

  let body: LoginRequestBody;
  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const password = (body.password || "").trim();
  if (!validateAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: getAdminSessionTokenValue(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
