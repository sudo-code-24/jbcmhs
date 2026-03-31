import { NextResponse } from "next/server";
import { getServerBackendUrl } from "@/lib/serverBackendUrl";

const API_URL = getServerBackendUrl();

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/push/vapid-public-key`, {
      cache: "no-store",
    });
    const data = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      return NextResponse.json(
        (data as { error?: string }) ?? { error: "Unable to load VAPID key" },
        { status: response.status },
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Push service unavailable" }, { status: 503 });
  }
}
