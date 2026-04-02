import { NextResponse } from "next/server";
import { getStrapiUrl } from "@/lib/strapi/config";

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

  const email = String(body.email ?? "").trim().toLowerCase();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (!email || !currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "email, currentPassword, and newPassword are required" },
      { status: 400 }
    );
  }

  const base = getStrapiUrl();
  let loginRes: Response;
  try {
    loginRes = await fetch(`${base}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password: currentPassword }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Authentication service is unavailable" }, { status: 503 });
  }

  const loginJson = (await loginRes.json().catch(() => null)) as {
    jwt?: string;
    user?: { id?: number };
    error?: { message?: string };
  } | null;

  if (!loginRes.ok || !loginJson?.jwt || loginJson.user?.id == null) {
    const msg = loginJson?.error?.message || "Current password is incorrect";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const put = await fetch(`${base}/api/users/${loginJson.user.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loginJson.jwt}`,
    },
    body: JSON.stringify({ password: newPassword }),
    cache: "no-store",
  });

  if (!put.ok) {
    const text = await put.text();
    return NextResponse.json({ error: text || "Password change failed" }, { status: put.status });
  }

  return NextResponse.json({ success: true });
}
