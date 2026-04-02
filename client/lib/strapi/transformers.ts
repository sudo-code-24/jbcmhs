import type {
  Announcement,
  AnnouncementCategory,
  Event,
  EventType,
  FacultyBoardApiResponse,
  FacultyCardItem,
  SchoolInfo,
  SchoolShowcaseFeature,
  StrapiMedia,
} from "@/lib/types";
import { ANNOUNCEMENT_CATEGORIES, EVENT_TYPES } from "@/lib/types";
import { flattenStrapiEntity, unwrapStrapiList, unwrapStrapiSingle } from "./flatten";

function blocksArrayToPlain(blocks: unknown[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (!b || typeof b !== "object") continue;
    const children = (b as { children?: unknown[] }).children;
    if (!Array.isArray(children)) continue;
    for (const c of children) {
      if (c && typeof c === "object" && "text" in c && typeof (c as { text?: unknown }).text === "string") {
        parts.push((c as { text: string }).text);
      }
    }
  }
  return parts.join("\n").trim();
}

function strapiRichTextToPlain(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return blocksArrayToPlain(value);
  }
  if (value && typeof value === "object" && "blocks" in (value as object)) {
    const blocks = (value as { blocks?: unknown[] }).blocks;
    if (!Array.isArray(blocks)) return "";
    return blocksArrayToPlain(blocks);
  }
  return "";
}

function pickStrapiMediaUrl(flat: Record<string, unknown>): string | undefined {
  const top = flat.url;
  if (typeof top === "string" && top.trim()) return top.trim();

  const fm = flat.formats;
  if (fm && typeof fm === "object" && fm !== null && !Array.isArray(fm)) {
    const order = ["large", "medium", "small", "thumbnail"] as const;
    for (const key of order) {
      const slot = (fm as Record<string, unknown>)[key];
      if (slot && typeof slot === "object" && slot !== null) {
        const u = (slot as { url?: unknown }).url;
        if (typeof u === "string" && u.trim()) return u.trim();
      }
    }
  }
  return undefined;
}

/** Normalize Strapi media (flat or nested `data`) to client shape. */
export function normalizeStrapiMedia(raw: unknown): StrapiMedia | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  let node: unknown = raw;
  if (typeof node === "object" && node !== null && "data" in node) {
    const d = (node as { data: unknown }).data;
    if (d === null) return null;
    if (d === undefined) return undefined;
    node = d;
  }
  if (Array.isArray(node)) {
    node = node[0];
  }
  if (node == null || typeof node !== "object") return undefined;

  const flat = flattenStrapiEntity(node);
  const url = pickStrapiMediaUrl(flat);
  if (!url) return undefined;
  return {
    url,
    alternativeText: typeof flat.alternativeText === "string" ? flat.alternativeText : undefined,
  };
}

function pickCategoryName(category: unknown): AnnouncementCategory {
  if (!category) return "General";
  const flat = flattenStrapiEntity(category);
  const name = typeof flat.name === "string" ? flat.name : "";
  return (ANNOUNCEMENT_CATEGORIES as readonly string[]).includes(name)
    ? (name as AnnouncementCategory)
    : "General";
}

/** Strapi `school-event.eventType` uses `other` where the old app used `sports`. */
function strapiEventTypeToClient(t: unknown): EventType {
  const s = typeof t === "string" ? t : "event";
  if (s === "other") return "sports";
  if ((EVENT_TYPES as readonly string[]).includes(s)) return s as EventType;
  return "event";
}

export function clientEventTypeToStrapi(t: EventType): "academic" | "event" | "other" {
  if (t === "sports") return "other";
  if (t === "academic" || t === "event") return t;
  return "event";
}

export function strapiAnnouncementToClient(raw: unknown): Announcement {
  const ent = flattenStrapiEntity(unwrapStrapiSingle(raw));
  const id = Number(ent.id);
  const published =
    typeof ent.publishedAt === "string"
      ? ent.publishedAt
      : typeof ent.createdAt === "string"
        ? ent.createdAt
        : new Date().toISOString();
  return {
    id: Number.isFinite(id) ? id : 0,
    title: String(ent.title ?? ""),
    content: strapiRichTextToPlain(ent.content),
    category: pickCategoryName(ent.category),
    datePosted: published,
    image: normalizeStrapiMedia(ent.image),
  };
}

export function strapiAnnouncementsCollectionToClient(raw: unknown): Announcement[] {
  return unwrapStrapiList(raw).map((item) => strapiAnnouncementToClient({ data: item }));
}

export function strapiEventToClient(raw: unknown): Event {
  const ent = flattenStrapiEntity(unwrapStrapiSingle(raw));
  const id = Number(ent.id);
  const startsAt =
    typeof ent.startsAt === "string" ? ent.startsAt : typeof ent.starts_at === "string" ? ent.starts_at : "";
  const endsAt =
    typeof ent.endsAt === "string" ? ent.endsAt : typeof ent.ends_at === "string" ? ent.ends_at : undefined;
  return {
    id: Number.isFinite(id) ? id : 0,
    title: String(ent.title ?? ""),
    description: typeof ent.description === "string" ? ent.description : "",
    date: startsAt || new Date().toISOString(),
    endDate: endsAt || undefined,
    type: strapiEventTypeToClient(ent.eventType),
    image: normalizeStrapiMedia(ent.image),
  };
}

export function strapiSchoolEventsCollectionToClient(raw: unknown): Event[] {
  return unwrapStrapiList(raw).map((item) => strapiEventToClient({ data: item }));
}

function parseSchoolShowcaseFeatures(raw: unknown): SchoolShowcaseFeature[] {
  if (raw == null) return [];
  const list = Array.isArray(raw) ? raw : unwrapStrapiList({ data: raw });
  const out: SchoolShowcaseFeature[] = [];
  for (const item of list) {
    const f = flattenStrapiEntity(item);
    const title = String(f.title ?? "").trim();
    if (!title) continue;
    out.push({
      title,
      text: String(f.text ?? ""),
      icon: typeof f.icon === "string" && f.icon.trim() ? f.icon.trim() : "⭐",
    });
  }
  return out;
}

export function strapiSchoolProfileToClient(raw: unknown): SchoolInfo | null {
  const ent = flattenStrapiEntity(unwrapStrapiSingle(raw));
  if (!ent || Object.keys(ent).length === 0) return null;
  const id = Number(ent.id);
  const mission = strapiRichTextToPlain(ent.mission);
  const vision = strapiRichTextToPlain(ent.vision);
  const history = strapiRichTextToPlain(ent.history);
  const firstLine = (txt: string) => txt.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
  const taglineExplicit = typeof ent.tagline === "string" ? ent.tagline.trim() : "";
  return {
    id: Number.isFinite(id) ? id : 1,
    name: String(ent.name ?? ""),
    tagline: taglineExplicit || firstLine(mission) || firstLine(vision) || "",
    history,
    mission,
    vision,
    phone: String(ent.phone ?? ""),
    email: String(ent.email ?? ""),
    address: String(ent.address ?? ""),
    officeHours: String(ent.officeHours ?? ""),
    facebookUrl:
      typeof ent.facebookUrl === "string" && ent.facebookUrl.trim()
        ? ent.facebookUrl.trim()
        : undefined,
    heroQuote: typeof ent.heroQuote === "string" ? ent.heroQuote : undefined,
    heroHeading: typeof ent.heroHeading === "string" ? ent.heroHeading : undefined,
    heroDescription: typeof ent.heroDescription === "string" ? ent.heroDescription : undefined,
    heroImage: normalizeStrapiMedia(ent.heroImage),
    schoolInfoImage: normalizeStrapiMedia(ent.schoolInfoImage),
    showcaseFeatures: parseSchoolShowcaseFeatures(ent.showcaseFeatures),
  };
}

/** Build `{ rows, cards, sheetEmpty }` from `GET /api/grade-levels?populate=...`. */
export function strapiGradeLevelsToFacultyBoard(raw: unknown): FacultyBoardApiResponse {
  const rows: string[] = [];
  const cards: FacultyCardItem[] = [];
  const grades = unwrapStrapiList(raw).map((g) => flattenStrapiEntity(g));

  grades.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

  for (const g of grades) {
    const gradeName = String(g.name ?? "");
    const sections = g.boardSections;
    if (!Array.isArray(sections)) continue;
    const secSorted = sections
      .map((s) => flattenStrapiEntity(s))
      .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

    for (const sec of secSorted) {
      const title = String(sec.title ?? "").trim();
      if (!title) continue;
      rows.push(title);
      const members = sec.facultyMembers;
      if (!Array.isArray(members)) continue;
      const memSorted = members
        .map((m) => flattenStrapiEntity(m))
        .sort((a, b) => (Number(a.positionIndex) || 0) - (Number(b.positionIndex) || 0));

      for (const m of memSorted) {
        cards.push({
          id: String(m.importKey ?? m.documentId ?? m.id ?? ""),
          name: String(m.fullName ?? ""),
          role: String(m.roleTitle ?? ""),
          department: gradeName,
          email: m.email ? String(m.email).trim() || undefined : undefined,
          phone: m.phone ? String(m.phone).trim() || undefined : undefined,
          image: normalizeStrapiMedia(m.image),
          boardSection: title,
          positionIndex: Number(m.positionIndex) || 0,
        });
      }
    }
  }

  const sheetEmpty = rows.length === 0 && cards.length === 0;
  return { rows, cards, sheetEmpty };
}
