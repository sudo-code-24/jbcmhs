import { type NextRequest, NextResponse } from "next/server";
import { requireStrapiAdmin } from "@/lib/auth/strapiSession";
import { adminCreateUser } from "@/lib/strapi/strapiUsersApi";

type SignupRequestBody = {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
};

export async function POST(request: NextRequest) {
  const gate = await requireStrapiAdmin(request);
  if (gate instanceof NextResponse) return gate;

  let body: SignupRequestBody;
  try {
    body = (await request.json()) as SignupRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username = String(body.username ?? "").trim().toLowerCase();
  const emailRaw = String(body.email ?? "").trim().toLowerCase();
  const email = emailRaw || `${username}@jbcmhs.local`;
  const password = String(body.password ?? "");
  const roleInput = String(body.role ?? "faculty").trim().toLowerCase();

  if (!username || !password) {
    return NextResponse.json({ error: "username and password are required" }, { status: 400 });
  }
  if (roleInput !== "admin" && roleInput !== "faculty") {
    return NextResponse.json({ error: "role must be 'admin' or 'faculty'" }, { status: 400 });
  }

  try {
    await adminCreateUser({
      username,
      email,
      password,
      app_role: roleInput,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sign up failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ success: true, user: { username, email } }, { status: 201 });
}
