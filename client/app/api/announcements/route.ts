import { NextRequest, NextResponse } from "next/server";
import { requireContentEditor } from "@/lib/auth/requireContentEditor";
import { debugLogFormData } from "@/lib/strapi/formDataDebug";
import { strapiCreateAnnouncement } from "@/lib/strapi/cmsWrites";
import { strapiAnnouncementToClient } from "@/lib/strapi/transformers";
import type { AnnouncementCategory } from "@/lib/types";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/types";

function parseCategory(raw: FormDataEntryValue | null): AnnouncementCategory | null {
  const s = String(raw ?? "").trim();
  return (ANNOUNCEMENT_CATEGORIES as readonly string[]).includes(s) ? (s as AnnouncementCategory) : null;
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
  const content = String(formData.get("content") ?? "").trim();
  const category = parseCategory(formData.get("category"));
  const datePostedRaw = String(formData.get("datePosted") ?? "").trim();
  const datePosted = datePostedRaw ? new Date(datePostedRaw).toISOString() : undefined;

  if (!title || !content || !category) {
    return NextResponse.json({ error: "title, content, and category are required" }, { status: 400 });
  }

  const file = formData.get("files.image");
  const imageFile = file instanceof File && file.size > 0 ? file : undefined;

  debugLogFormData(formData, "POST /api/announcements");

  try {
    const raw = await strapiCreateAnnouncement({
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
      console.error("[announcements POST]", e);
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status });
  }
}
