import { type NextRequest, NextResponse } from "next/server";
import { requireStrapiAdmin } from "@/lib/auth/strapiSession";
import { adminFindUserByUsername, adminUpdateUserPassword } from "@/lib/strapi/strapiUsersApi";

type Params = { params: Promise<{ username: string }> };

function getDefaultResetPassword(): string {
  return process.env.STRAPI_DEFAULT_RESET_PASSWORD || "jbcmhs_local";
}

export async function POST(request: NextRequest, { params }: Params) {
  const gate = await requireStrapiAdmin(request);
  if (gate instanceof NextResponse) return gate;

  const { username: raw } = await params;
  const username = decodeURIComponent(raw || "").trim().toLowerCase();
  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const user = await adminFindUserByUsername(username);
  if (!user?.id) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    void gate.jwt;
    await adminUpdateUserPassword(user.id, getDefaultResetPassword());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Reset password failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
