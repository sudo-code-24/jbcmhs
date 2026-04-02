import { NextRequest, NextResponse } from "next/server";
import { requireContentEditor } from "@/lib/auth/requireContentEditor";
import { debugLogFormData } from "@/lib/strapi/formDataDebug";
import { strapiDeleteSchoolEvent, strapiUpdateSchoolEvent } from "@/lib/strapi/cmsWrites";
import { strapiEventToClient } from "@/lib/strapi/transformers";
import type { EventType } from "@/lib/types";
import { EVENT_TYPES } from "@/lib/types";

function parseEventType(raw: FormDataEntryValue | null): EventType | undefined {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  return (EVENT_TYPES as readonly string[]).includes(s) ? (s as EventType) : undefined;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentEditor(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const titleRaw = formData.get("title");
  const descriptionRaw = formData.get("description");
  const dateRaw = formData.get("date");
  const endDateRaw = String(formData.get("endDate") ?? "").trim();

  const title = titleRaw != null && String(titleRaw).trim() !== "" ? String(titleRaw).trim() : undefined;
  const description =
    descriptionRaw != null ? String(descriptionRaw) : undefined;
  const date = dateRaw != null && String(dateRaw).trim() !== "" ? String(dateRaw).trim() : undefined;
  const endDate = endDateRaw || undefined;
  const type = formData.has("type") ? parseEventType(formData.get("type")) : undefined;

  const file = formData.get("files.image");
  const imageFile = file instanceof File && file.size > 0 ? file : undefined;

  debugLogFormData(formData, `PUT /api/events/${id}`);

  if (
    title === undefined &&
    description === undefined &&
    date === undefined &&
    endDate === undefined &&
    type === undefined &&
    !imageFile
  ) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const raw = await strapiUpdateSchoolEvent(id, {
      title,
      description,
      date,
      endDate,
      type,
      imageFile,
      imageFileName: imageFile?.name,
    });
    return NextResponse.json(strapiEventToClient(raw));
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as Error & { status: number }).status : 500;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[events PUT]", e);
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentEditor(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  try {
    await strapiDeleteSchoolEvent(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as Error & { status: number }).status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status });
  }
}
