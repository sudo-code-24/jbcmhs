import { NextRequest, NextResponse } from "next/server";

function strapiOrigin(): string | null {
  const a = process.env.STRAPI_URL?.trim().replace(/\/$/, "");
  if (a) return a;
  const b = process.env.NEXT_PUBLIC_STRAPI_URL?.trim().replace(/\/$/, "");
  const c = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  return b || c || null;
}

/**
 * Proxies Strapi static uploads so `<img src="/uploads/...">` works on the Next host
 * when only server-side `STRAPI_URL` is set (no public Strapi URL in the browser).
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path: segments } = await ctx.params;
  if (!segments?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (segments[0] !== "uploads") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  for (const seg of segments) {
    if (seg.includes("..") || seg.includes("\\") || seg === "") {
      return NextResponse.json({ error: "Bad path" }, { status: 400 });
    }
  }

  const origin = strapiOrigin();
  if (!origin) {
    return NextResponse.json({ error: "STRAPI_URL or NEXT_PUBLIC_STRAPI_URL is not set" }, { status: 503 });
  }

  const upstream = `${origin}/${segments.join("/")}`;
  const res = await fetch(upstream, { cache: "no-store" });

  if (!res.ok) {
    const errText = await res.text();
    return new NextResponse(errText || res.statusText, { status: res.status });
  }

  const contentType = res.headers.get("Content-Type") ?? "application/octet-stream";
  if (!res.body) {
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
