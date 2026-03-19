import { createCalendarEvent, deleteCalendarEvent, upsertCalendarEvent } from "../lib/googleCalendar";
import { normalizeImageUrl } from "../lib/googleDrive";
import { RowRecord, deleteCacheByPrefix, getNextNumericId, readTable, writeTable } from "../lib/googleSheetsStore";

type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  type: string;
  imageUrl?: string;
  googleEventId?: string;
};

const SHEET_NAME = process.env.GOOGLE_SHEET_EVENTS || "events";
const HEADERS = ["id", "title", "description", "date", "endDate", "type", "imageUrl", "googleEventId"];
const TABLE_CACHE_PREFIX = `sheet:${SHEET_NAME}`;

function notFound(): never {
  const err = new Error("Event not found") as Error & { status: number };
  err.status = 404;
  throw err;
}

function toEvent(row: RowRecord): Event {
  const dateValue = row.date ? new Date(row.date) : new Date();
  const imageUrl = normalizeImageUrl(row.imageUrl) || undefined;
  return {
    id: Number.parseInt(row.id ?? "0", 10),
    title: row.title ?? "",
    description: row.description ?? "",
    date: dateValue.toISOString(),
    endDate: row.endDate ? new Date(row.endDate).toISOString() : undefined,
    type: row.type ?? "",
    imageUrl,
    googleEventId: row.googleEventId || undefined,
  };
}

function sortByDateAsc(rows: RowRecord[]): RowRecord[] {
  return [...rows].sort((a, b) => {
    const left = new Date(a.date ?? "").getTime();
    const right = new Date(b.date ?? "").getTime();
    return left - right;
  });
}

export async function getAll(): Promise<Event[]> {
  const rows = await readTable(SHEET_NAME, 60_000);
  return sortByDateAsc(rows).map(toEvent);
}

export async function getById(id: string | number): Promise<Event> {
  const rows = await readTable(SHEET_NAME, 60_000);
  const row = rows.find((item) => item.id === String(id));
  if (!row) notFound();
  return toEvent(row);
}

export async function create(data: {
  title: string;
  description: string;
  date: string | Date;
  endDate?: string | Date;
  type: string;
  imageUrl?: string;
}): Promise<Event> {
  const rows = await readTable(SHEET_NAME, 0);
  const imageUrl = (data.imageUrl ?? "").trim() || "";
  const date = new Date(data.date).toISOString();
  const endDate = data.endDate ? new Date(data.endDate).toISOString() : "";
  const googleEventId = await createCalendarEvent({
    title: data.title,
    description: data.description ?? "",
    startDate: date,
    endDate: endDate || undefined,
    type: data.type,
  });

  const row: RowRecord = {
    id: String(getNextNumericId(rows)),
    title: data.title,
    description: data.description ?? "",
    date,
    endDate,
    type: data.type,
    imageUrl,
    googleEventId: googleEventId ?? "",
  };

  await writeTable(SHEET_NAME, HEADERS, [...rows, row]);
  deleteCacheByPrefix(TABLE_CACHE_PREFIX);
  return toEvent(row);
}

export async function update(
  id: string | number,
  data: {
    title?: string;
    description?: string;
    date?: string | Date;
    endDate?: string | Date;
    type?: string;
    imageUrl?: string;
  }
): Promise<Event> {
  const rows = await readTable(SHEET_NAME, 0);
  const index = rows.findIndex((item) => item.id === String(id));
  if (index < 0) notFound();

  const existing = rows[index];
  const nextImageUrl =
    data.imageUrl !== undefined ? ((data.imageUrl ?? "").trim() || "") : (existing.imageUrl ?? "");
  const nextDate = data.date ? new Date(data.date).toISOString() : existing.date ?? new Date().toISOString();
  const nextEndDate =
    data.endDate !== undefined
      ? (data.endDate ? new Date(data.endDate).toISOString() : "")
      : existing.endDate ?? "";
  const nextGoogleEventId = await upsertCalendarEvent(existing.googleEventId, {
    title: data.title ?? existing.title ?? "",
    description: data.description ?? existing.description ?? "",
    startDate: nextDate,
    endDate: nextEndDate || undefined,
    type: data.type ?? existing.type ?? "",
  });

  const nextRow: RowRecord = {
    id: existing.id ?? String(id),
    title: data.title ?? existing.title ?? "",
    description: data.description ?? existing.description ?? "",
    date: nextDate,
    endDate: nextEndDate,
    type: data.type ?? existing.type ?? "",
    imageUrl: nextImageUrl,
    googleEventId: nextGoogleEventId ?? existing.googleEventId ?? "",
  };

  const nextRows = [...rows];
  nextRows[index] = nextRow;
  await writeTable(SHEET_NAME, HEADERS, nextRows);
  deleteCacheByPrefix(TABLE_CACHE_PREFIX);
  return toEvent(nextRow);
}

export async function remove(id: string | number): Promise<Event> {
  const rows = await readTable(SHEET_NAME, 0);
  const index = rows.findIndex((item) => item.id === String(id));
  if (index < 0) notFound();

  const toDelete = rows[index];
  await deleteCalendarEvent(toDelete.googleEventId);
  const [deleted] = rows.splice(index, 1);
  await writeTable(SHEET_NAME, HEADERS, rows);
  deleteCacheByPrefix(TABLE_CACHE_PREFIX);
  return toEvent(deleted);
}
