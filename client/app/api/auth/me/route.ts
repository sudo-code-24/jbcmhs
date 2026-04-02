import { NextRequest, NextResponse } from "next/server";
import {
  fetchStrapiMe,
  requireStrapiJwt,
  resolveAppRole,
} from "@/lib/auth/strapiSession";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireStrapiJwt(request);
  if (auth instanceof NextResponse) return auth;

  const me = await fetchStrapiMe(auth.jwt);
  if (!me) {
    return NextResponse.json({ error: "Unable to load user" }, { status: 502 });
  }

  return NextResponse.json({
    email: me.email ?? "",
    username: me.username ?? "",
    role: resolveAppRole(me),
  });
}
