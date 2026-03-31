import { NextResponse } from "next/server";
import { getServerBackendUrl } from "@/lib/serverBackendUrl";

export async function GET() {
  try {
    const response = await fetch(`${getServerBackendUrl()}/api/push/status`, {
      cache: "no-store",
    });
    const data = (await response.json().catch(() => null)) as unknown;
    return NextResponse.json(data ?? { error: "Invalid response" }, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Could not reach API" }, { status: 503 });
  }
}
