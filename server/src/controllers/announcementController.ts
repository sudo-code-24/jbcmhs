import { Request, Response, NextFunction } from "express";
import * as announcementService from "../services/announcementService";
import { broadcastNewAnnouncement } from "../services/pushService";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : null;
    const items = await announcementService.getAll(limit);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await announcementService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, content, category, datePosted, imageUrl } = req.body;
    if (!title || !content || !category) {
      res.status(400).json({ error: "title, content, and category are required" });
      return;
    }
    const item = await announcementService.create({ title, content, category, datePosted, imageUrl });
    broadcastNewAnnouncement(item.title);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, content, category, datePosted, imageUrl } = req.body;
    const data: { title?: string; content?: string; category?: string; datePosted?: string; imageUrl?: string } = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (category !== undefined) data.category = category;
    if (datePosted !== undefined) data.datePosted = datePosted;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    const item = await announcementService.update(req.params.id, data);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await announcementService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
