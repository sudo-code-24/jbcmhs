import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
