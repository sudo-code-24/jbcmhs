import type { AnnouncementCategory, EventType } from "@/lib/types";
import { clientEventTypeToStrapi } from "./transformers";
import { getStrapiToken, getStrapiUrl } from "./config";

async function strapiRawJson(method: string, path: string, body?: unknown): Promise<{ status: number; json: unknown }> {
  const url = `${getStrapiUrl()}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${getStrapiToken()}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

export async function findAnnouncementCategoryDocumentId(name: string): Promise<string | null> {
  const path = `/api/announcement-categories?filters[name][$eq]=${encodeURIComponent(name)}&pagination[pageSize]=1`;
  const { status, json } = await strapiRawJson("GET", path);
  if (status !== 200 || !json || typeof json !== "object") return null;
  const data = (json as { data?: unknown[] }).data;
  const first = Array.isArray(data) ? data[0] : null;
  if (!first || typeof first !== "object") return null;
  const doc = (first as { documentId?: string }).documentId;
  return typeof doc === "string" ? doc : null;
}

/** Resolve Strapi documentId for announcements (numeric id or documentId in URL). */
export async function resolveAnnouncementDocumentId(idParam: string): Promise<string | null> {
  const tryDirect = await strapiRawJson(
    "GET",
    `/api/announcements/${encodeURIComponent(idParam)}?pagination[pageSize]=1`
  );
  if (tryDirect.status === 200 && tryDirect.json && typeof tryDirect.json === "object") {
    const data = (tryDirect.json as { data?: { documentId?: string } }).data;
    if (data?.documentId) return data.documentId;
  }
  const filt = await strapiRawJson(
    "GET",
    `/api/announcements?filters[id][$eq]=${encodeURIComponent(idParam)}&pagination[pageSize]=1`
  );
  if (filt.status === 200 && filt.json && typeof filt.json === "object") {
    const arr = (filt.json as { data?: { documentId?: string }[] }).data;
    const first = Array.isArray(arr) ? arr[0] : null;
    if (first?.documentId) return first.documentId;
  }
  return null;
}

export async function resolveSchoolEventDocumentId(idParam: string): Promise<string | null> {
  const tryDirect = await strapiRawJson(
    "GET",
    `/api/school-events/${encodeURIComponent(idParam)}?pagination[pageSize]=1`
  );
  if (tryDirect.status === 200 && tryDirect.json && typeof tryDirect.json === "object") {
    const data = (tryDirect.json as { data?: { documentId?: string } }).data;
    if (data?.documentId) return data.documentId;
  }
  const filt = await strapiRawJson(
    "GET",
    `/api/school-events?filters[id][$eq]=${encodeURIComponent(idParam)}&pagination[pageSize]=1`
  );
  if (filt.status === 200 && filt.json && typeof filt.json === "object") {
    const arr = (filt.json as { data?: { documentId?: string }[] }).data;
    const first = Array.isArray(arr) ? arr[0] : null;
    if (first?.documentId) return first.documentId;
  }
  return null;
}

export async function strapiCreateAnnouncement(data: {
  title: string;
  content: string;
  category: AnnouncementCategory;
  datePosted?: string;
  imageFile?: Blob | null;
  imageFileName?: string;
}): Promise<unknown> {
  const categoryId = await findAnnouncementCategoryDocumentId(data.category);
  if (!categoryId) {
    const err = new Error(`Unknown announcement category: ${data.category}`) as Error & { status: number };
    err.status = 400;
    throw err;
  }
  const fields: Record<string, unknown> = {
    title: data.title,
    content: data.content,
    publishedAt: data.datePosted ?? new Date().toISOString(),
    category: categoryId,
  };
  if (data.imageFile && data.imageFile.size > 0) {
    fields.image = await strapiUploadContentApiFile(
      data.imageFile,
      data.imageFileName ?? "upload.jpg",
    );
  }
  const { status, json } = await strapiRawJson("POST", "/api/announcements", { data: fields });
  if (status !== 200 && status !== 201) {
    const err = new Error(JSON.stringify(json)) as Error & { status: number };
    err.status = status;
    throw err;
  }
  return json;
}

export async function strapiUpdateAnnouncement(
  idParam: string,
  data: {
    title?: string;
    content?: string;
    category?: AnnouncementCategory;
    datePosted?: string;
    imageFile?: Blob | null;
    imageFileName?: string;
  },
): Promise<unknown> {
  const documentId = await resolveAnnouncementDocumentId(idParam);
  if (!documentId) {
    const err = new Error("Announcement not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  const body: Record<string, unknown> = {};
  if (data.title !== undefined) body.title = data.title;
  if (data.content !== undefined) body.content = data.content;
  if (data.datePosted !== undefined) body.publishedAt = data.datePosted;
  if (data.category !== undefined) {
    const categoryId = await findAnnouncementCategoryDocumentId(data.category);
    if (!categoryId) {
      const err = new Error(`Unknown announcement category: ${data.category}`) as Error & { status: number };
      err.status = 400;
      throw err;
    }
    body.category = categoryId;
  }
  if (data.imageFile && data.imageFile.size > 0) {
    body.image = await strapiUploadContentApiFile(
      data.imageFile,
      data.imageFileName ?? "upload.jpg",
    );
  }
  const { status, json } = await strapiRawJson("PUT", `/api/announcements/${documentId}`, { data: body });
  if (status !== 200) {
    const err = new Error(JSON.stringify(json)) as Error & { status: number };
    err.status = status;
    throw err;
  }
  return json;
}

export async function strapiDeleteAnnouncement(idParam: string): Promise<void> {
  const documentId = await resolveAnnouncementDocumentId(idParam);
  if (!documentId) {
    const err = new Error("Announcement not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  const res = await fetch(`${getStrapiUrl()}/api/announcements/${documentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getStrapiToken()}` },
    cache: "no-store",
  });
  if (res.status !== 200 && res.status !== 204) {
    const text = await res.text();
    const err = new Error(text) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
}

export async function strapiCreateSchoolEvent(data: {
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  type: EventType;
  imageFile?: Blob | null;
  imageFileName?: string;
}): Promise<unknown> {
  const fields: Record<string, unknown> = {
    title: data.title,
    description: data.description ?? "",
    startsAt: data.date,
    endsAt: data.endDate || undefined,
    eventType: clientEventTypeToStrapi(data.type),
  };
  if (data.imageFile && data.imageFile.size > 0) {
    fields.image = await strapiUploadContentApiFile(
      data.imageFile,
      data.imageFileName ?? "upload.jpg",
    );
  }
  const { status, json } = await strapiRawJson("POST", "/api/school-events", { data: fields });
  if (status !== 200 && status !== 201) {
    const err = new Error(JSON.stringify(json)) as Error & { status: number };
    err.status = status;
    throw err;
  }
  return json;
}

export async function strapiUpdateSchoolEvent(
  idParam: string,
  data: {
    title?: string;
    description?: string;
    date?: string;
    endDate?: string;
    type?: EventType;
    imageFile?: Blob | null;
    imageFileName?: string;
  },
): Promise<unknown> {
  const documentId = await resolveSchoolEventDocumentId(idParam);
  if (!documentId) {
    const err = new Error("Event not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  const body: Record<string, unknown> = {};
  if (data.title !== undefined) body.title = data.title;
  if (data.description !== undefined) body.description = data.description;
  if (data.date !== undefined) body.startsAt = data.date;
  if (data.endDate !== undefined) body.endsAt = data.endDate || null;
  if (data.type !== undefined) body.eventType = clientEventTypeToStrapi(data.type);
  if (data.imageFile && data.imageFile.size > 0) {
    body.image = await strapiUploadContentApiFile(
      data.imageFile,
      data.imageFileName ?? "upload.jpg",
    );
  }
  const { status, json } = await strapiRawJson("PUT", `/api/school-events/${documentId}`, { data: body });
  if (status !== 200) {
    const err = new Error(JSON.stringify(json)) as Error & { status: number };
    err.status = status;
    throw err;
  }
  return json;
}

export async function resolveFacultyMemberDocumentIdByImportKey(importKey: string): Promise<string | null> {
  const q = `filters[importKey][$eq]=${encodeURIComponent(importKey)}&pagination[pageSize]=1`;
  const { status, json } = await strapiRawJson("GET", `/api/faculty-members?${q}`);
  if (status !== 200 || !json || typeof json !== "object") return null;
  const arr = (json as { data?: { documentId?: string }[] }).data;
  const first = Array.isArray(arr) ? arr[0] : null;
  const doc = first?.documentId;
  return typeof doc === "string" ? doc : null;
}

export async function strapiUpdateFacultyMemberImage(
  importKey: string,
  imageFile: Blob,
  imageFileName = "photo.jpg",
): Promise<unknown> {
  const documentId = await resolveFacultyMemberDocumentIdByImportKey(importKey);
  if (!documentId) {
    const err = new Error("Faculty member not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  const fileId = await strapiUploadContentApiFile(imageFile, imageFileName);
  const { status, json } = await strapiRawJson("PUT", `/api/faculty-members/${documentId}`, {
    data: { image: fileId },
  });
  if (status !== 200) {
    const err = new Error(JSON.stringify(json)) as Error & { status: number };
    err.status = status;
    throw err;
  }
  return json;
}

export async function strapiDeleteSchoolEvent(idParam: string): Promise<void> {
  const documentId = await resolveSchoolEventDocumentId(idParam);
  if (!documentId) {
    const err = new Error("Event not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  const res = await fetch(`${getStrapiUrl()}/api/school-events/${documentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getStrapiToken()}` },
    cache: "no-store",
  });
  if (res.status !== 200 && res.status !== 204) {
    const text = await res.text();
    const err = new Error(text) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
}

export type SchoolProfileUpsertPayload = {
  name: string;
  tagline?: string;
  heroQuote?: string;
  heroHeading?: string;
  heroDescription?: string;
  phone?: string;
  email?: string;
  address?: string;
  officeHours?: string;
  facebookUrl?: string;
  history?: string;
  mission?: string;
  vision?: string;
  showcaseFeatures: { title: string; text?: string; icon?: string }[];
};

/** Strapi 5 single-type `PUT` does not merge multipart into `request.body.data` (see core single-type controller). */
async function strapiUploadContentApiFile(file: Blob, fileName: string): Promise<number> {
  const fd = new FormData();
  fd.append("files", file, fileName);
  const url = `${getStrapiUrl()}/api/upload`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${getStrapiToken()}` },
    body: fd,
    cache: "no-store",
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (res.status !== 200 && res.status !== 201) {
    const err = new Error(JSON.stringify(json)) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  const idFromNode = (node: unknown): number | undefined => {
    if (node && typeof node === "object" && node !== null && "id" in node) {
      const n = Number((node as { id: unknown }).id);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  let id: number | undefined;
  if (Array.isArray(json)) {
    id = idFromNode(json[0]);
  } else if (json && typeof json === "object") {
    const data = (json as { data?: unknown }).data;
    if (Array.isArray(data)) id = idFromNode(data[0]);
    else if (data && typeof data === "object") id = idFromNode(data);
    else id = idFromNode(json);
  }

  if (id == null || !Number.isFinite(id)) {
    const err = new Error("Upload did not return a file id") as Error & { status: number };
    err.status = 502;
    throw err;
  }
  return id;
}

function optionalStrapiEmail(raw?: string): string | null {
  const t = raw?.trim() ?? "";
  return t.length > 0 ? t : null;
}

export async function strapiUpsertSchoolProfile(
  data: SchoolProfileUpsertPayload,
  files?: {
    heroImage?: Blob | null;
    schoolInfoImage?: Blob | null;
    heroName?: string;
    schoolInfoName?: string;
  },
): Promise<unknown> {
  const showcaseFeatures = data.showcaseFeatures.map((f) => ({
    title: f.title,
    text: f.text ?? "",
    icon: f.icon?.trim() ? f.icon : "⭐",
  }));

  const fields: Record<string, unknown> = {
    name: data.name,
    tagline: data.tagline ?? "",
    heroQuote: data.heroQuote ?? "",
    heroHeading: data.heroHeading ?? "",
    heroDescription: data.heroDescription ?? "",
    phone: data.phone ?? "",
    email: optionalStrapiEmail(data.email),
    address: data.address ?? "",
    officeHours: data.officeHours ?? "",
    facebookUrl: data.facebookUrl ?? "",
    history: data.history ?? "",
    mission: data.mission ?? "",
    vision: data.vision ?? "",
    showcaseFeatures,
  };

  const hasHero = Boolean(files?.heroImage && files.heroImage.size > 0);
  const hasSchool = Boolean(files?.schoolInfoImage && files.schoolInfoImage.size > 0);

  if (hasHero) {
    fields.heroImage = await strapiUploadContentApiFile(files!.heroImage!, files!.heroName ?? "hero.jpg");
  }
  if (hasSchool) {
    fields.schoolInfoImage = await strapiUploadContentApiFile(
      files!.schoolInfoImage!,
      files!.schoolInfoName ?? "school-info.jpg",
    );
  }

  let { status, json } = await strapiRawJson("PUT", "/api/school-profile", { data: fields });
  if (status === 404) {
    const r2 = await strapiRawJson("POST", "/api/school-profile", { data: fields });
    status = r2.status;
    json = r2.json;
  }
  if (status !== 200 && status !== 201) {
    const err = new Error(JSON.stringify(json)) as Error & { status: number };
    err.status = status;
    throw err;
  }
  return json;
}
