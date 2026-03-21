/**
 * One-time migration: writes faculty board data to the Google Sheet `faculty` tab.
 *
 * Usage (from repo `server/` directory, with `.env` configured):
 *   npm run migrate:faculty
 *   npm run migrate:faculty -- --force
 *   npm run migrate:faculty -- --force /path/to/board.json
 *
 * Default source: ../../client/data/facultyBoard.initial.json (bundled sample data).
 *
 * Custom JSON may be:
 *   - An array of cards (same shape as facultyBoard.initial.json), or
 *   - `{ "rows": string[], "cards": FacultyCardItem[] }` (e.g. exported from browser localStorage).
 *
 * Without --force, exits if the sheet already contains data (not empty).
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { getBoard, saveBoard, type FacultyCardItem } from "../src/services/facultyBoardService";

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

function normalizeCards(cards: FacultyCardItem[]): FacultyCardItem[] {
  return cards.map((card, index) => ({
    ...card,
    positionIndex: Number.isFinite(card.positionIndex) ? card.positionIndex : index + 1,
  }));
}

function loadPayload(filePath: string): { rows: string[]; cards: FacultyCardItem[] } {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;

  if (Array.isArray(parsed)) {
    const cards = normalizeCards(parsed as FacultyCardItem[]);
    return { rows: deriveRowsFromCards(cards), cards };
  }

  if (parsed && typeof parsed === "object" && "cards" in parsed) {
    const o = parsed as { rows?: unknown; cards?: unknown };
    const cards = normalizeCards((o.cards ?? []) as FacultyCardItem[]);
    const rows =
      Array.isArray(o.rows) && o.rows.every((r) => typeof r === "string")
        ? (o.rows as string[]).map((r) => r.trim())
        : deriveRowsFromCards(cards);
    return { rows, cards };
  }

  throw new Error("Invalid JSON: expected an array of cards or { rows, cards }");
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
  const pathArg = argv.find((a) => !a.startsWith("--"));

  const defaultSeed = path.join(__dirname, "../../client/data/facultyBoard.initial.json");
  const sourcePath = pathArg ? path.resolve(pathArg) : defaultSeed;

  if (!fs.existsSync(sourcePath)) {
    console.error(`File not found: ${sourcePath}`);
    process.exit(1);
  }

  const existing = await getBoard();
  const hasSavedData = !existing.sheetEmpty;
  if (hasSavedData && !force) {
    console.error(
      "The faculty sheet already has data. Re-run with --force to replace it, or clear the sheet tab first."
    );
    process.exit(1);
  }

  const { rows, cards } = loadPayload(sourcePath);
  await saveBoard({ rows, cards });
  console.log(
    `Wrote ${cards.length} card(s), ${rows.length} section row(s) to Google Sheets from:\n  ${sourcePath}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
