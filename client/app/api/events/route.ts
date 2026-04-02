import { NextRequest, NextResponse } from "next/server";
import { requireContentEditor } from "@/lib/auth/requireContentEditor";
import { debugLogFormData } from "@/lib/strapi/formDataDebug";
import { strapiCreateSchoolEvent } from "@/lib/strapi/cmsWrites";
import { strapiEventToClient } from "@/lib/strapi/transformers";
import type { EventType } from "@/lib/types";
import { EVENT_TYPES } from "@/lib/types";

function parseEventType(raw: FormDataEntryValue | null): EventType | null {
  const s = String(raw ?? "").trim();
  return (EVENT_TYPES as readonly string[]).includes(s) ? (s as EventType) : null;
}

export async function POST(request: NextRequest) {
  const auth = await requireContentEditor(request);
  if (auth instanceof NextResponse) return auth;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const endDateRaw = String(formData.get("endDate") ?? "").trim();
  const type = parseEventType(formData.get("type"));

  if (!title || !date || !type) {
    return NextResponse.json({ error: "title, date, and type are required" }, { status: 400 });
  }

  const file = formData.get("files.image");
  const imageFile = file instanceof File && file.size > 0 ? file : undefined;

  debugLogFormData(formData, "POST /api/events");

  try {
    const raw = await strapiCreateSchoolEvent({
      title,
      description,
      date,
      endDate: endDateRaw ? endDateRaw : undefined,
      type,
      imageFile,
      imageFileName: imageFile?.name,
    });
    return NextResponse.json(strapiEventToClient(raw));
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as Error & { status: number }).status : 500;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[events POST]", e);
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status });
  }
}
