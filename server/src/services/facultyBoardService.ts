import { normalizeImageUrl } from "../lib/googleDrive";
import { RowRecord, readTable, writeTable } from "../lib/googleSheetsStore";

export type FacultyCardItem = {
  id: string;
  name: string;
  role: string;
  department: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  boardSection: string;
  positionIndex: number;
};

export type FacultyBoardPayload = {
  rows: string[];
  cards: FacultyCardItem[];
};

export type FacultyBoardResponse = FacultyBoardPayload & {
  /** True when the sheet tab has no data rows yet (first deploy); client may seed from JSON. */
  sheetEmpty: boolean;
};

const SHEET_NAME = process.env.GOOGLE_SHEET_FACULTY || "faculty";
const META_ID = "__meta__";

const HEADERS = [
  "id",
  "name",
  "role",
  "department",
  "email",
  "phone",
  "photoUrl",
  "boardSection",
  "positionIndex",
  "rowsJson",
];

function deriveRowsFromCards(cards: FacultyCardItem[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  cards.forEach((card) => {
    const section = (card.boardSection ?? "").trim();
    if (!section) return;
    if (seen.has(section)) return;
    seen.add(section);
    ordered.push(section);
  });
  return ordered;
}

function cardFromRow(row: RowRecord): FacultyCardItem {
  const pi = Number.parseInt(String(row.positionIndex ?? "0"), 10);
  return {
    id: row.id ?? "",
    name: row.name ?? "",
    role: row.role ?? "",
    department: row.department ?? "",
    email: (row.email ?? "").trim() || undefined,
    phone: (row.phone ?? "").trim() || undefined,
    photoUrl: normalizeImageUrl(row.photoUrl) || undefined,
    boardSection: (row.boardSection ?? "").trim(),
    positionIndex: Number.isFinite(pi) ? pi : 0,
  };
}

export async function getBoard(): Promise<FacultyBoardResponse> {
  const rows = await readTable(SHEET_NAME, 0);
  if (rows.length === 0) {
    return { rows: [], cards: [], sheetEmpty: true };
  }

  const meta = rows.find((r) => r.id === META_ID);
  let rowsOrder: string[] = [];
  if (meta?.rowsJson) {
    try {
      const parsed = JSON.parse(meta.rowsJson) as unknown;
      if (Array.isArray(parsed)) {
        rowsOrder = parsed.filter((x): x is string => typeof x === "string").map((s) => s.trim());
      }
    } catch {
      /* ignore */
    }
  }

  const cardRows = rows.filter((r) => r.id && r.id !== META_ID);
  const cards = cardRows.map(cardFromRow);

  if (rowsOrder.length === 0) {
    rowsOrder = deriveRowsFromCards(cards);
  }

  return { rows: rowsOrder, cards, sheetEmpty: false };
}

export async function saveBoard(payload: FacultyBoardPayload): Promise<void> {
  const rowsOrder = payload.rows.map((r) => String(r));
  const metaRow: RowRecord = {
    id: META_ID,
    name: "",
    role: "",
    department: "",
    email: "",
    phone: "",
    photoUrl: "",
    boardSection: "",
    positionIndex: "",
    rowsJson: JSON.stringify(rowsOrder),
  };

  const cardRows: RowRecord[] = payload.cards.map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    department: c.department,
    email: c.email ?? "",
    phone: c.phone ?? "",
    photoUrl: c.photoUrl ?? "",
    boardSection: c.boardSection,
    positionIndex: String(c.positionIndex),
    rowsJson: "",
  }));

  await writeTable(SHEET_NAME, HEADERS, [metaRow, ...cardRows]);
}
