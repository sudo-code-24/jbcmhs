import type { FacultyCardItem } from "@/lib/types";
import { getStrapiToken, getStrapiUrl } from "./config";
import { flattenStrapiEntity, unwrapStrapiList } from "./flatten";

type StrapiWriteResult = { data?: { documentId?: string; id?: number } };

async function strapiAdmin(
  method: string,
  pathWithQuery: string,
  body?: unknown
): Promise<{ status: number; json: unknown; text: string }> {
  const url = `${getStrapiUrl()}${pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`}`;
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
  return { status: res.status, json, text };
}

function requireOk(
  r: { status: number; text: string; json: unknown },
  label: string
): StrapiWriteResult {
  if (r.status < 200 || r.status >= 300) {
    throw new Error(`${label}: ${r.status} ${r.text}`);
  }
  return (r.json ?? {}) as StrapiWriteResult;
}

async function findGradeDocumentIdByName(name: string): Promise<string | null> {
  const q = `filters[name][$eq]=${encodeURIComponent(name)}&pagination[pageSize]=1`;
  const r = await strapiAdmin("GET", `/api/grade-levels?${q}`);
  if (r.status !== 200 || !r.json) return null;
  const list = unwrapStrapiList(r.json);
  const first = list[0];
  if (!first || typeof first !== "object") return null;
  const doc = String((first as { documentId?: string }).documentId ?? "");
  return doc || null;
}

async function ensureGradeLevel(name: string, sortOrder: number): Promise<string> {
  const existing = await findGradeDocumentIdByName(name);
  if (existing) {
    const put = await strapiAdmin("PUT", `/api/grade-levels/${existing}`, {
      data: { sortOrder },
    });
    requireOk(put, `PUT grade-level ${existing}`);
    return existing;
  }
  const post = await strapiAdmin("POST", "/api/grade-levels", {
    data: { name, sortOrder },
  });
  const out = requireOk(post, "POST grade-level");
  const id = out.data?.documentId;
  if (!id) throw new Error("POST grade-level: missing documentId");
  return id;
}

async function findBoardSectionDocumentIdByTitle(title: string): Promise<string | null> {
  const q = `filters[title][$eq]=${encodeURIComponent(title)}&pagination[pageSize]=1`;
  const r = await strapiAdmin("GET", `/api/board-sections?${q}`);
  if (r.status !== 200 || !r.json) return null;
  const list = unwrapStrapiList(r.json);
  const first = list[0];
  if (!first || typeof first !== "object") return null;
  const doc = String((first as { documentId?: string }).documentId ?? "");
  return doc || null;
}

async function ensureBoardSection(
  title: string,
  sortOrder: number,
  gradeLevelDocumentId: string
): Promise<string> {
  const existing = await findBoardSectionDocumentIdByTitle(title);
  if (existing) {
    const put = await strapiAdmin("PUT", `/api/board-sections/${existing}`, {
      data: { sortOrder, gradeLevel: gradeLevelDocumentId },
    });
    requireOk(put, `PUT board-section ${existing}`);
    return existing;
  }
  const post = await strapiAdmin("POST", "/api/board-sections", {
    data: { title, sortOrder, gradeLevel: gradeLevelDocumentId },
  });
  const out = requireOk(post, "POST board-section");
  const id = out.data?.documentId;
  if (!id) throw new Error("POST board-section: missing documentId");
  return id;
}

async function findFacultyByImportKey(importKey: string): Promise<string | null> {
  const q = `filters[importKey][$eq]=${encodeURIComponent(importKey)}&pagination[pageSize]=1`;
  const r = await strapiAdmin("GET", `/api/faculty-members?${q}`);
  if (r.status !== 200 || !r.json) return null;
  const list = unwrapStrapiList(r.json);
  const first = list[0];
  if (!first || typeof first !== "object") return null;
  const doc = String((first as { documentId?: string }).documentId ?? "");
  return doc || null;
}

async function upsertFacultyMember(
  card: FacultyCardItem,
  boardSectionDocumentId: string
): Promise<void> {
  const importKey = card.id;
  const payload = {
    importKey,
    fullName: card.name,
    roleTitle: card.role,
    email: card.email?.trim() || undefined,
    phone: card.phone?.trim() || undefined,
    positionIndex: card.positionIndex,
    boardSection: boardSectionDocumentId,
  };
  const existing = await findFacultyByImportKey(importKey);
  if (existing) {
    const put = await strapiAdmin("PUT", `/api/faculty-members/${existing}`, { data: payload });
    requireOk(put, `PUT faculty-member ${existing}`);
    return;
  }
  const post = await strapiAdmin("POST", "/api/faculty-members", { data: payload });
  requireOk(post, "POST faculty-member");
}

async function listAllFacultyDocumentIds(): Promise<{ documentId: string; importKey: string }[]> {
  const out: { documentId: string; importKey: string }[] = [];
  let page = 1;
  const pageSize = 100;
  for (;;) {
    const r = await strapiAdmin(
      "GET",
      `/api/faculty-members?pagination[page]=${page}&pagination[pageSize]=${pageSize}&fields[0]=importKey`
    );
    if (r.status !== 200 || !r.json) break;
    const list = unwrapStrapiList(r.json).map((item) => flattenStrapiEntity(item));
    for (const row of list) {
      const documentId = String(row.documentId ?? "");
      const importKey = String(row.importKey ?? "");
      if (documentId && importKey) out.push({ documentId, importKey });
    }
    if (list.length < pageSize) break;
    page += 1;
  }
  return out;
}

/**
 * Replaces the Google-Sheet-style `{ rows, cards }` payload into Strapi
 * `grade-level` → `board-section` → `faculty-member` relations.
 *
 * Note: `board-section.title` is unique in Strapi; two grades cannot share the same section title.
 */
export async function syncFacultyBoardToStrapi(payload: {
  rows: string[];
  cards: FacultyCardItem[];
}): Promise<void> {
  const rows = payload.rows.map((r) => String(r).trim()).filter(Boolean);
  const cards = payload.cards;

  const gradeFirstRow = new Map<string, number>();
  for (let i = 0; i < rows.length; i++) {
    const title = rows[i];
    const card = cards.find((c) => c.boardSection.trim() === title);
    const g = (card?.department ?? "").trim() || "General";
    if (!gradeFirstRow.has(g)) gradeFirstRow.set(g, i);
  }
  for (const c of cards) {
    const sec = c.boardSection.trim();
    if (!sec) continue;
    const g = (c.department ?? "").trim() || "General";
    if (!gradeFirstRow.has(g)) gradeFirstRow.set(g, rows.length);
  }

  const gradesOrdered = Array.from(gradeFirstRow.entries()).sort((a, b) => a[1] - b[1]);
  const gradeDocByName = new Map<string, string>();
  for (let i = 0; i < gradesOrdered.length; i++) {
    const [name] = gradesOrdered[i];
    const doc = await ensureGradeLevel(name, i);
    gradeDocByName.set(name, doc);
  }

  const sectionDocByTitle = new Map<string, string>();
  for (let i = 0; i < rows.length; i++) {
    const sectionTitle = rows[i];
    const card = cards.find((c) => c.boardSection.trim() === sectionTitle);
    const gradeName = (card?.department ?? "").trim() || "General";
    const gradeDoc = gradeDocByName.get(gradeName);
    if (!gradeDoc) continue;
    const secDoc = await ensureBoardSection(sectionTitle, i, gradeDoc);
    sectionDocByTitle.set(sectionTitle, secDoc);
  }

  for (const c of cards) {
    const sectionTitle = c.boardSection.trim();
    if (!sectionTitle) continue;
    let secDoc = sectionDocByTitle.get(sectionTitle);
    if (!secDoc) {
      const gradeName = (c.department ?? "").trim() || "General";
      const gradeDoc = gradeDocByName.get(gradeName);
      if (!gradeDoc) continue;
      secDoc = await ensureBoardSection(sectionTitle, rows.length + sectionDocByTitle.size, gradeDoc);
      sectionDocByTitle.set(sectionTitle, secDoc);
    }
    await upsertFacultyMember(c, secDoc);
  }

  const keepKeys = new Set(cards.map((c) => c.id).filter(Boolean));
  const existing = await listAllFacultyDocumentIds();
  for (const { documentId, importKey } of existing) {
    if (!keepKeys.has(importKey)) {
      const del = await strapiAdmin("DELETE", `/api/faculty-members/${documentId}`);
      if (del.status !== 200 && del.status !== 204) {
        throw new Error(`DELETE faculty-member ${documentId}: ${del.status} ${del.text}`);
      }
    }
  }
}
