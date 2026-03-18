"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.getById = getById;
exports.create = create;
exports.update = update;
exports.remove = remove;
const googleDrive_1 = require("../lib/googleDrive");
const googleCalendar_1 = require("../lib/googleCalendar");
const googleSheetsStore_1 = require("../lib/googleSheetsStore");
const SHEET_NAME = process.env.GOOGLE_SHEET_EVENTS || "events";
const HEADERS = ["id", "title", "description", "date", "endDate", "type", "imageFileId", "googleEventId"];
const TABLE_CACHE_PREFIX = `sheet:${SHEET_NAME}`;
function notFound() {
    const err = new Error("Event not found");
    err.status = 404;
    throw err;
}
function toEvent(row) {
    const imageFileId = (0, googleDrive_1.extractDriveFileId)(row.imageFileId);
    const dateValue = row.date ? new Date(row.date) : new Date();
    return {
        id: Number.parseInt(row.id ?? "0", 10),
        title: row.title ?? "",
        description: row.description ?? "",
        date: dateValue.toISOString(),
        endDate: row.endDate ? new Date(row.endDate).toISOString() : undefined,
        type: row.type ?? "",
        imageFileId: imageFileId || undefined,
        imageUrl: (0, googleDrive_1.toPublicImageUrl)(imageFileId) || undefined,
        googleEventId: row.googleEventId || undefined,
    };
}
function sortByDateAsc(rows) {
    return [...rows].sort((a, b) => {
        const left = new Date(a.date ?? "").getTime();
        const right = new Date(b.date ?? "").getTime();
        return left - right;
    });
}
async function getAll() {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 60000);
    return sortByDateAsc(rows).map(toEvent);
}
async function getById(id) {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 60000);
    const row = rows.find((item) => item.id === String(id));
    if (!row)
        notFound();
    return toEvent(row);
}
async function create(data) {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 0);
    const imageFileId = (0, googleDrive_1.extractDriveFileId)(data.imageFileId);
    await (0, googleDrive_1.assertDriveFileExists)(imageFileId);
    const date = new Date(data.date).toISOString();
    const endDate = data.endDate ? new Date(data.endDate).toISOString() : "";
    const googleEventId = await (0, googleCalendar_1.createCalendarEvent)({
        title: data.title,
        description: data.description ?? "",
        startDate: date,
        endDate: endDate || undefined,
        type: data.type,
    });
    console.log("googleEventId", googleEventId);
    const row = {
        id: String((0, googleSheetsStore_1.getNextNumericId)(rows)),
        title: data.title,
        description: data.description ?? "",
        date,
        endDate,
        type: data.type,
        imageFileId,
        googleEventId: googleEventId ?? "",
    };
    await (0, googleSheetsStore_1.writeTable)(SHEET_NAME, HEADERS, [...rows, row]);
    (0, googleSheetsStore_1.deleteCacheByPrefix)(TABLE_CACHE_PREFIX);
    return toEvent(row);
}
async function update(id, data) {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 0);
    const index = rows.findIndex((item) => item.id === String(id));
    if (index < 0)
        notFound();
    const existing = rows[index];
    const nextImageFileId = data.imageFileId !== undefined ? (0, googleDrive_1.extractDriveFileId)(data.imageFileId) : existing.imageFileId ?? "";
    await (0, googleDrive_1.assertDriveFileExists)(nextImageFileId);
    const nextDate = data.date ? new Date(data.date).toISOString() : existing.date ?? new Date().toISOString();
    const nextEndDate = data.endDate !== undefined
        ? (data.endDate ? new Date(data.endDate).toISOString() : "")
        : existing.endDate ?? "";
    const nextGoogleEventId = await (0, googleCalendar_1.upsertCalendarEvent)(existing.googleEventId, {
        title: data.title ?? existing.title ?? "",
        description: data.description ?? existing.description ?? "",
        startDate: nextDate,
        endDate: nextEndDate || undefined,
        type: data.type ?? existing.type ?? "",
    });
    const nextRow = {
        id: existing.id ?? String(id),
        title: data.title ?? existing.title ?? "",
        description: data.description ?? existing.description ?? "",
        date: nextDate,
        endDate: nextEndDate,
        type: data.type ?? existing.type ?? "",
        imageFileId: nextImageFileId,
        googleEventId: nextGoogleEventId ?? existing.googleEventId ?? "",
    };
    const nextRows = [...rows];
    nextRows[index] = nextRow;
    await (0, googleSheetsStore_1.writeTable)(SHEET_NAME, HEADERS, nextRows);
    (0, googleSheetsStore_1.deleteCacheByPrefix)(TABLE_CACHE_PREFIX);
    return toEvent(nextRow);
}
async function remove(id) {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 0);
    const index = rows.findIndex((item) => item.id === String(id));
    if (index < 0)
        notFound();
    const toDelete = rows[index];
    await (0, googleCalendar_1.deleteCalendarEvent)(toDelete.googleEventId);
    const [deleted] = rows.splice(index, 1);
    await (0, googleSheetsStore_1.writeTable)(SHEET_NAME, HEADERS, rows);
    (0, googleSheetsStore_1.deleteCacheByPrefix)(TABLE_CACHE_PREFIX);
    return toEvent(deleted);
}
//# sourceMappingURL=eventService.js.map