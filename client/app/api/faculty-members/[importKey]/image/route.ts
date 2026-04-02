import { NextRequest, NextResponse } from "next/server";
import { requireContentEditor } from "@/lib/auth/requireContentEditor";
import { debugLogFormData } from "@/lib/strapi/formDataDebug";
import { strapiUpdateFacultyMemberImage } from "@/lib/strapi/cmsWrites";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ importKey: string }> },
) {
  const auth = await requireContentEditor(request);
  if (auth instanceof NextResponse) return auth;

  const { importKey: keyParam } = await params;
  const importKey = decodeURIComponent(keyParam);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("files.image");
  debugLogFormData(formData, `POST /api/faculty-members/.../image`);
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Image file required" }, { status: 400 });
  }

  try {
    await strapiUpdateFacultyMemberImage(importKey, file, file.name || "photo.jpg");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as Error & { status: number }).status : 500;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[faculty image POST]", e);
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status });
  }
}
