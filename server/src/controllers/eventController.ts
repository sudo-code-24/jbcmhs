import { Request, Response, NextFunction } from "express";
import * as eventService from "../services/eventService";
import { broadcastNewEvent } from "../services/pushService";

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await eventService.getAll();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await eventService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, date, endDate, type, imageUrl } = req.body;
    if (!title || !date || !type) {
      res.status(400).json({ error: "title, date, and type are required" });
      return;
    }
    const item = await eventService.create({
      title,
      description: description ?? "",
      date,
      endDate,
      type,
      imageUrl,
    });
    broadcastNewEvent(item.title);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, date, endDate, type, imageUrl } = req.body;
    const data: {
      title?: string;
      description?: string;
      date?: string | Date;
      endDate?: string | Date;
      type?: string;
      imageUrl?: string;
    } = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (date !== undefined) data.date = date;
    if (endDate !== undefined) data.endDate = endDate;
    if (type !== undefined) data.type = type;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    const item = await eventService.update(req.params.id, data);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await eventService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
