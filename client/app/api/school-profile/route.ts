import { NextRequest, NextResponse } from "next/server";
import { requireContentEditor } from "@/lib/auth/requireContentEditor";
import { debugLogFormData } from "@/lib/strapi/formDataDebug";
import { strapiUpsertSchoolProfile } from "@/lib/strapi/cmsWrites";
import { getStrapiToken, getStrapiUrl } from "@/lib/strapi/config";
import { SCHOOL_PROFILE_POPULATE } from "@/lib/strapi/queries";
import { strapiSchoolProfileToClient } from "@/lib/strapi/transformers";

async function fetchSchoolProfilePopulated(): Promise<unknown> {
  const url = `${getStrapiUrl()}/api/school-profile?${SCHOOL_PROFILE_POPULATE}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getStrapiToken()}` },
    cache: "no-store",
  });
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireContentEditor(request);
  if (auth instanceof NextResponse) return auth;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  debugLogFormData(formData, "PUT /api/school-profile");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  let showcaseFeatures: { title: string; text?: string; icon?: string }[] = [];
  const sfRaw = formData.get("showcaseFeatures");
  try {
    const parsed = sfRaw ? JSON.parse(String(sfRaw)) : [];
    if (Array.isArray(parsed)) {
      showcaseFeatures = parsed.map((row: unknown) => {
        if (!row || typeof row !== "object") return { title: "" };
        const o = row as Record<string, unknown>;
        return {
          title: String(o.title ?? "").trim(),
          text: String(o.text ?? ""),
          icon: String(o.icon ?? ""),
        };
      }).filter((r) => r.title.length > 0);
    }
  } catch {
    return NextResponse.json({ error: "Invalid showcaseFeatures JSON" }, { status: 400 });
  }

  const heroFile = formData.get("files.heroImage");
  const schoolFile = formData.get("files.schoolInfoImage");

  try {
    await strapiUpsertSchoolProfile(
      {
        name,
        tagline: String(formData.get("tagline") ?? ""),
        heroQuote: String(formData.get("heroQuote") ?? ""),
        heroHeading: String(formData.get("heroHeading") ?? ""),
        heroDescription: String(formData.get("heroDescription") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        email: String(formData.get("email") ?? "").trim(),
        address: String(formData.get("address") ?? ""),
        officeHours: String(formData.get("officeHours") ?? ""),
        facebookUrl: String(formData.get("facebookUrl") ?? ""),
        history: String(formData.get("history") ?? ""),
        mission: String(formData.get("mission") ?? ""),
        vision: String(formData.get("vision") ?? ""),
        showcaseFeatures,
      },
      {
        heroImage: heroFile instanceof File && heroFile.size > 0 ? heroFile : undefined,
        schoolInfoImage: schoolFile instanceof File && schoolFile.size > 0 ? schoolFile : undefined,
        heroName: heroFile instanceof File ? heroFile.name : undefined,
        schoolInfoName: schoolFile instanceof File ? schoolFile.name : undefined,
      },
    );

    const raw = await fetchSchoolProfilePopulated();
    const client = strapiSchoolProfileToClient(raw);
    if (!client) {
      return NextResponse.json({ error: "Unable to load school profile after save" }, { status: 502 });
    }
    return NextResponse.json(client);
  } catch (e) {
    const status = e instanceof Error && "status" in e ? (e as Error & { status: number }).status : 500;
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[school-profile PUT]", e);
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : "Request failed" }, { status });
  }
}
