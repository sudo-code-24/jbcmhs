import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

type ChangePasswordBody = {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
};

export async function POST(request: Request) {
  let body: ChangePasswordBody;
  try {
    body = (await request.json()) as ChangePasswordBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (!email || !currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "email, currentPassword, and newPassword are required" },
      { status: 400 }
    );
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, currentPassword, newPassword }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Authentication service is unavailable" }, { status: 503 });
  }

  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    return NextResponse.json({ error: data?.error || "Password change failed" }, { status: response.status });
  }

  return NextResponse.json({ success: true });
}
