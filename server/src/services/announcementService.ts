import { assertDriveFileExists, extractDriveFileId, toPublicImageUrl } from "../lib/googleDrive";
import {
  RowRecord,
  deleteCacheByPrefix,
  getNextNumericId,
  readTable,
  writeTable,
} from "../lib/googleSheetsStore";

type Announcement = {
  id: number;
  title: string;
  content: string;
  category: string;
  datePosted: string;
  imageFileId?: string;
  imageUrl?: string;
};

const SHEET_NAME = process.env.GOOGLE_SHEET_ANNOUNCEMENTS || "announcements";
const HEADERS = ["id", "title", "content", "category", "datePosted", "imageFileId"];
const TABLE_CACHE_PREFIX = `sheet:${SHEET_NAME}`;

function notFound(): never {
  const err = new Error("Announcement not found") as Error & { status: number };
  err.status = 404;
  throw err;
}

function toAnnouncement(row: RowRecord): Announcement {
  const imageFileId = extractDriveFileId(row.imageFileId);
  return {
    id: Number.parseInt(row.id ?? "0", 10),
    title: row.title ?? "",
    content: row.content ?? "",
    category: row.category ?? "",
    datePosted: row.datePosted || new Date().toISOString(),
    imageFileId: imageFileId || undefined,
    imageUrl: toPublicImageUrl(imageFileId) || undefined,
  };
}

function sortByDateDesc(rows: RowRecord[]): RowRecord[] {
  return [...rows].sort((a, b) => {
    const left = new Date(a.datePosted ?? "").getTime();
    const right = new Date(b.datePosted ?? "").getTime();
    return right - left;
  });
}

function normalizeDatePosted(value?: string): string {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

export async function getAll(limit: number | null): Promise<Announcement[]> {
  const rows = await readTable(SHEET_NAME, 60_000);
  const sorted = sortByDateDesc(rows);
  const mapped = sorted.map(toAnnouncement);
  return limit ? mapped.slice(0, limit) : mapped;
}

export async function getById(id: string | number): Promise<Announcement> {
  const rows = await readTable(SHEET_NAME, 60_000);
  const target = String(id);
  const row = rows.find((item) => item.id === target);
  if (!row) notFound();
  return toAnnouncement(row);
}

export async function create(data: {
  title: string;
  content: string;
  category: string;
  datePosted?: string;
  imageFileId?: string;
}): Promise<Announcement> {
  const rows = await readTable(SHEET_NAME, 0);
  const imageFileId = extractDriveFileId(data.imageFileId);
  await assertDriveFileExists(imageFileId);

  const row: RowRecord = {
    id: String(getNextNumericId(rows)),
    title: data.title,
    content: data.content,
    category: data.category,
    datePosted: normalizeDatePosted(data.datePosted),
    imageFileId,
  };

  await writeTable(SHEET_NAME, HEADERS, [...rows, row]);
  deleteCacheByPrefix(TABLE_CACHE_PREFIX);
  return toAnnouncement(row);
}

export async function update(
  id: string | number,
  data: { title?: string; content?: string; category?: string; datePosted?: string; imageFileId?: string }
): Promise<Announcement> {
  const rows = await readTable(SHEET_NAME, 0);
  const target = String(id);
  const index = rows.findIndex((item) => item.id === target);
  if (index < 0) notFound();

  const existing = rows[index];
  const nextImageFileId =
    data.imageFileId !== undefined ? extractDriveFileId(data.imageFileId) : existing.imageFileId ?? "";
  await assertDriveFileExists(nextImageFileId);

  const nextRow: RowRecord = {
    id: existing.id ?? target,
    title: data.title ?? existing.title ?? "",
    content: data.content ?? existing.content ?? "",
    category: data.category ?? existing.category ?? "",
    datePosted:
      data.datePosted !== undefined
        ? normalizeDatePosted(data.datePosted)
        : existing.datePosted ?? new Date().toISOString(),
    imageFileId: nextImageFileId,
  };

  const nextRows = [...rows];
  nextRows[index] = nextRow;
  await writeTable(SHEET_NAME, HEADERS, nextRows);
  deleteCacheByPrefix(TABLE_CACHE_PREFIX);
  return toAnnouncement(nextRow);
}

export async function remove(id: string | number): Promise<Announcement> {
  const rows = await readTable(SHEET_NAME, 0);
  const target = String(id);
  const index = rows.findIndex((item) => item.id === target);
  if (index < 0) notFound();

  const [deleted] = rows.splice(index, 1);
  await writeTable(SHEET_NAME, HEADERS, rows);
  deleteCacheByPrefix(TABLE_CACHE_PREFIX);
  return toAnnouncement(deleted);
}
