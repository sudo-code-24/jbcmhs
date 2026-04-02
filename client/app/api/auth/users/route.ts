import { type NextRequest, NextResponse } from "next/server";
import { requireStrapiAdmin } from "@/lib/auth/strapiSession";
import { adminListUsers } from "@/lib/strapi/strapiUsersApi";

export async function GET(request: NextRequest) {
  const gate = await requireStrapiAdmin(request);
  if (gate instanceof NextResponse) return gate;

  try {
    void gate.jwt;
    const users = await adminListUsers();
    return NextResponse.json(users);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unable to load users";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
