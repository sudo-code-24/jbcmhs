"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoard = getBoard;
exports.saveBoard = saveBoard;
const googleDrive_1 = require("../lib/googleDrive");
const googleSheetsStore_1 = require("../lib/googleSheetsStore");
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
function deriveRowsFromCards(cards) {
    const seen = new Set();
    const ordered = [];
    cards.forEach((card) => {
        const section = (card.boardSection ?? "").trim();
        if (!section)
            return;
        if (seen.has(section))
            return;
        seen.add(section);
        ordered.push(section);
    });
    return ordered;
}
function cardFromRow(row) {
    const pi = Number.parseInt(String(row.positionIndex ?? "0"), 10);
    return {
        id: row.id ?? "",
        name: row.name ?? "",
        role: row.role ?? "",
        department: row.department ?? "",
        email: (row.email ?? "").trim() || undefined,
        phone: (row.phone ?? "").trim() || undefined,
        photoUrl: (0, googleDrive_1.normalizeImageUrl)(row.photoUrl) || undefined,
        boardSection: (row.boardSection ?? "").trim(),
        positionIndex: Number.isFinite(pi) ? pi : 0,
    };
}
async function getBoard() {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 0);
    if (rows.length === 0) {
        return { rows: [], cards: [], sheetEmpty: true };
    }
    const meta = rows.find((r) => r.id === META_ID);
    let rowsOrder = [];
    if (meta?.rowsJson) {
        try {
            const parsed = JSON.parse(meta.rowsJson);
            if (Array.isArray(parsed)) {
                rowsOrder = parsed.filter((x) => typeof x === "string").map((s) => s.trim());
            }
        }
        catch {
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
async function saveBoard(payload) {
    const rowsOrder = payload.rows.map((r) => String(r));
    const metaRow = {
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
    const cardRows = payload.cards.map((c) => ({
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
    await (0, googleSheetsStore_1.writeTable)(SHEET_NAME, HEADERS, [metaRow, ...cardRows]);
}
//# sourceMappingURL=facultyBoardService.js.map