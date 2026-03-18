import { Request, Response, NextFunction } from "express";
import * as schoolInfoService from "../services/schoolInfoService";

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const info = await schoolInfoService.get();
    res.json(info);
  } catch (err) {
    next(err);
  }
}

export async function upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, history, mission, vision, phone, email, address, officeHours, heroImageUrl, schoolImageUrl } = req.body;
    const data = { name, history, mission, vision, phone, email, address, officeHours, heroImageUrl, schoolImageUrl };
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v != null && v !== "")
    ) as Record<string, string>;
    if (Object.keys(filtered).length === 0) {
      res.status(400).json({ error: "At least one field is required" });
      return;
    }
    const info = await schoolInfoService.upsert(filtered);
    res.json(info);
  } catch (err) {
    next(err);
  }
}
