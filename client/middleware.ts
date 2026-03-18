import { NextRequest, NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, isValidAdminSessionCookie } from "@/lib/adminAuth";

export function middleware(request: NextRequest) {
  const cookieValue = request.cookies.get(ADMIN_AUTH_COOKIE)?.value;
  if (isValidAdminSessionCookie(cookieValue)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
