import { normalizeImageUrl } from "../lib/googleDrive";
import { RowRecord, deleteCacheByPrefix, readTable, writeTable } from "../lib/googleSheetsStore";

type SchoolInfo = {
  id: number;
  name: string;
  history: string;
  mission: string;
  vision: string;
  phone: string;
  email: string;
  address: string;
  officeHours: string;
  heroImageUrl?: string;
  schoolImageUrl?: string;
};

const SHEET_NAME = process.env.GOOGLE_SHEET_SCHOOL_INFO || "school_info";
const HEADERS = [
  "id",
  "name",
  "history",
  "mission",
  "vision",
  "phone",
  "email",
  "address",
  "officeHours",
  "heroImageUrl",
  "schoolImageUrl",
];
const TABLE_CACHE_PREFIX = `sheet:${SHEET_NAME}`;

function notFound(): never {
  const err = new Error("School info not found") as Error & { status: number };
  err.status = 404;
  throw err;
}

function toSchoolInfo(row: RowRecord): SchoolInfo {
  return {
    id: Number.parseInt(row.id ?? "1", 10),
    name: row.name ?? "",
    history: row.history ?? "",
    mission: row.mission ?? "",
    vision: row.vision ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    officeHours: row.officeHours ?? "",
    heroImageUrl: normalizeImageUrl(row.heroImageUrl) || undefined,
    schoolImageUrl: normalizeImageUrl(row.schoolImageUrl) || undefined,
  };
}

export async function get(): Promise<SchoolInfo> {
  const rows = await readTable(SHEET_NAME, 300_000);
  if (!rows.length) notFound();
  return toSchoolInfo(rows[0]);
}

export async function upsert(data: Record<string, string>): Promise<SchoolInfo> {
  const rows = await readTable(SHEET_NAME, 0);
  const current = rows[0] ?? ({ id: "1" } as RowRecord);

  const next: RowRecord = {
    id: current.id ?? "1",
    name: data.name ?? current.name ?? "",
    history: data.history ?? current.history ?? "",
    mission: data.mission ?? current.mission ?? "",
    vision: data.vision ?? current.vision ?? "",
    phone: data.phone ?? current.phone ?? "",
    email: data.email ?? current.email ?? "",
    address: data.address ?? current.address ?? "",
    officeHours: data.officeHours ?? current.officeHours ?? "",
    heroImageUrl: normalizeImageUrl(data.heroImageUrl ?? current.heroImageUrl ?? ""),
    schoolImageUrl: normalizeImageUrl(data.schoolImageUrl ?? current.schoolImageUrl ?? ""),
  };

  await writeTable(SHEET_NAME, HEADERS, [next]);
  deleteCacheByPrefix(TABLE_CACHE_PREFIX);
  return toSchoolInfo(next);
}
