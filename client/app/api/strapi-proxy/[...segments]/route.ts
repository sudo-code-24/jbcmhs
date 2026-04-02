import { getStrapiToken, getStrapiUrl } from "@/lib/strapi/config";
import { isAllowedStrapiProxyRoot } from "@/lib/strapi/strapiProxyAllowlist";
import { NextRequest, NextResponse } from "next/server";

/**
 * Forwards read-only Strapi REST calls from the browser so `STRAPI_API_TOKEN`
 * stays server-side. Only GET is allowed; mutations go through dedicated `/api/*` routes.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  if (!segments?.length) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!isAllowedStrapiProxyRoot(segments[0])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let token: string;
  let base: string;
  try {
    token = getStrapiToken();
    base = getStrapiUrl();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Strapi not configured" },
      { status: 500 }
    );
  }

  const path = `/api/${segments.join("/")}`;
  const target = new URL(path, `${base}/`);
  target.search = request.nextUrl.search;

  const res = await fetch(target, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}
