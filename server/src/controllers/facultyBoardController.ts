import { Request, Response, NextFunction } from "express";
import * as facultyBoardService from "../services/facultyBoardService";

function isCardItem(x: unknown): x is facultyBoardService.FacultyCardItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.role === "string" &&
    typeof o.department === "string" &&
    typeof o.boardSection === "string" &&
    typeof o.positionIndex === "number" &&
    Number.isFinite(o.positionIndex)
  );
}

export async function getBoard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const board = await facultyBoardService.getBoard();
    res.json(board);
  } catch (err) {
    next(err);
  }
}

export async function putBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as unknown;
    if (!body || typeof body !== "object") {
      res.status(400).json({ error: "Invalid body" });
      return;
    }
    const { rows, cards } = body as { rows?: unknown; cards?: unknown };
    if (!Array.isArray(rows) || !rows.every((r) => typeof r === "string")) {
      res.status(400).json({ error: "rows must be an array of strings" });
      return;
    }
    if (!Array.isArray(cards) || !cards.every(isCardItem)) {
      res.status(400).json({ error: "cards must be an array of faculty card objects" });
      return;
    }

    await facultyBoardService.saveBoard({
      rows,
      cards: cards.map((c) => ({
        ...c,
        email: c.email?.trim() ? c.email : undefined,
        phone: c.phone?.trim() ? c.phone : undefined,
        photoUrl: c.photoUrl?.trim() ? c.photoUrl : undefined,
      })),
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
