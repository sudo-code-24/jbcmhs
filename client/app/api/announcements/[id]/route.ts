import { NextRequest, NextResponse } from "next/server";
import { requireContentEditor } from "@/lib/auth/requireContentEditor";
import { debugLogFormData } from "@/lib/strapi/formDataDebug";
import { strapiDeleteAnnouncement, strapiUpdateAnnouncement } from "@/lib/strapi/cmsWrites";
import { strapiAnnouncementToClient } from "@/lib/strapi/transformers";
import type { AnnouncementCategory } from "@/lib/types";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/types";

function parseCategory(raw: FormDataEntryValue | null): AnnouncementCategory | undefined {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  return (ANNOUNCEMENT_CATEGORIES as readonly string[]).includes(s) ? (s as AnnouncementCategory) : undefined;
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
  const contentRaw = formData.get("content");
  const categoryRaw = formData.get("category");
  const datePostedRaw = String(formData.get("datePosted") ?? "").trim();

  const title = titleRaw != null && String(titleRaw).trim() !== "" ? String(titleRaw).trim() : undefined;
  const content = contentRaw != null && String(contentRaw).trim() !== "" ? String(contentRaw).trim() : undefined;
  const category = categoryRaw != null ? parseCategory(categoryRaw) : undefined;
  const datePosted = datePostedRaw ? new Date(datePostedRaw).toISOString() : undefined;

  const file = formData.get("files.image");
  const imageFile = file instanceof File && file.size > 0 ? file : undefined;

  debugLogFormData(formData, `PUT /api/announcements/${id}`);

  if (
    title === undefined &&
    content === undefined &&
    category === undefined &&
    datePosted === undefined &&
    !imageFile
  ) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const raw = await strapiUpdateAnnouncement(id, {
      title,
      content,
      category,
      datePosted,
      imageFile,
      imageFileName: imageFile?.name,
    });
    return NextResponse.json(strapiAnnouncementToClient(raw));
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as Error & { status: number }).status : 500;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[announcements PUT]", e);
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
    await strapiDeleteAnnouncement(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as Error & { status: number }).status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status });
  }
}
