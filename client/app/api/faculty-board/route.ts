import { NextRequest, NextResponse } from "next/server";
import { requireContentEditor } from "@/lib/auth/requireContentEditor";
import { syncFacultyBoardToStrapi } from "@/lib/strapi/facultyBoardSync";
import type { FacultyCardItem } from "@/lib/types";

export async function PUT(request: NextRequest) {
  const auth = await requireContentEditor(request);
  if (auth instanceof NextResponse) return auth;

  let body: { rows: string[]; cards: FacultyCardItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    await syncFacultyBoardToStrapi(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Request failed" },
      { status: 500 }
    );
  }
}
