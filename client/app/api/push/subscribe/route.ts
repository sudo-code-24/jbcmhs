import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://jbcmhs.onrender.com";

export async function POST(request: NextRequest) {
  const body = await request.text();
  try {
    const response = await fetch(`${API_URL}/api/push/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body || undefined,
      cache: "no-store",
    });
    const data = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      return NextResponse.json(
        data ?? { error: "Subscribe failed" },
        { status: response.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Push service unavailable" }, { status: 503 });
  }
}
