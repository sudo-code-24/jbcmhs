import { NextRequest, NextResponse } from "next/server";
import {
  STRAPI_JWT_COOKIE,
  verifyStrapiJwtEdge,
  verifyStrapiJwt,
} from "@/lib/auth/strapiJwtVerify";

/**
 * Only check that the session cookie is present. JWT signature/expiry is verified
 * in Node (e.g. `app/admin/page.tsx`, Route Handlers). Edge middleware often lacks
 * the same `process.env` Strapi secret as the Node server, which caused valid
 * logins to bounce while `/api/auth/me` still returned 200.
 */
export async function middleware(request: NextRequest) {
  const jwt = request.cookies.get(STRAPI_JWT_COOKIE)?.value;
  if (jwt) {
    console.log("JWT cookie found, allowing access to admin route");
    console.log({ verifyStrapiJwtEdge: await verifyStrapiJwtEdge(jwt) });
    console.log({ verifyStrapiJwt: await verifyStrapiJwt(jwt) });
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
