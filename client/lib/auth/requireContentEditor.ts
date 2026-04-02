import { type NextRequest, NextResponse } from "next/server";
import type { JWTPayload } from "jose";
import { requireStrapiJwt } from "./strapiSession";

/** Any signed-in school user (admin or faculty) may edit CMS-backed content via Next BFF routes. */
export async function requireContentEditor(
  request?: NextRequest
): Promise<{ jwt: string; payload: JWTPayload } | NextResponse> {
  return requireStrapiJwt(request);
}
