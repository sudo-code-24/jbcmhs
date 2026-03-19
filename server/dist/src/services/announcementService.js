"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.getById = getById;
exports.create = create;
exports.update = update;
exports.remove = remove;
const googleDrive_1 = require("../lib/googleDrive");
const googleSheetsStore_1 = require("../lib/googleSheetsStore");
const SHEET_NAME = process.env.GOOGLE_SHEET_ANNOUNCEMENTS || "announcements";
const HEADERS = ["id", "title", "content", "category", "datePosted", "imageUrl"];
const TABLE_CACHE_PREFIX = `sheet:${SHEET_NAME}`;
function notFound() {
    const err = new Error("Announcement not found");
    err.status = 404;
    throw err;
}
function toAnnouncement(row) {
    const imageUrl = (0, googleDrive_1.normalizeImageUrl)(row.imageUrl) || undefined;
    return {
        id: Number.parseInt(row.id ?? "0", 10),
        title: row.title ?? "",
        content: row.content ?? "",
        category: row.category ?? "",
        datePosted: row.datePosted || new Date().toISOString(),
        imageUrl,
    };
}
function sortByDateDesc(rows) {
    return [...rows].sort((a, b) => {
        const left = new Date(a.datePosted ?? "").getTime();
        const right = new Date(b.datePosted ?? "").getTime();
        return right - left;
    });
}
function normalizeDatePosted(value) {
    if (!value)
        return new Date().toISOString();
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime()))
        return new Date().toISOString();
    return parsed.toISOString();
}
async function getAll(limit) {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 60000);
    const sorted = sortByDateDesc(rows);
    const mapped = sorted.map(toAnnouncement);
    return limit ? mapped.slice(0, limit) : mapped;
}
async function getById(id) {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 60000);
    const target = String(id);
    const row = rows.find((item) => item.id === target);
    if (!row)
        notFound();
    return toAnnouncement(row);
}
async function create(data) {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 0);
    const imageUrl = (data.imageUrl ?? "").trim() || "";
    const row = {
        id: String((0, googleSheetsStore_1.getNextNumericId)(rows)),
        title: data.title,
        content: data.content,
        category: data.category,
        datePosted: normalizeDatePosted(data.datePosted),
        imageUrl,
    };
    await (0, googleSheetsStore_1.writeTable)(SHEET_NAME, HEADERS, [...rows, row]);
    (0, googleSheetsStore_1.deleteCacheByPrefix)(TABLE_CACHE_PREFIX);
    return toAnnouncement(row);
}
async function update(id, data) {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 0);
    const target = String(id);
    const index = rows.findIndex((item) => item.id === target);
    if (index < 0)
        notFound();
    const existing = rows[index];
    const nextImageUrl = data.imageUrl !== undefined ? (data.imageUrl ?? "").trim() : (existing.imageUrl ?? "").trim();
    const nextRow = {
        id: existing.id ?? target,
        title: data.title ?? existing.title ?? "",
        content: data.content ?? existing.content ?? "",
        category: data.category ?? existing.category ?? "",
        datePosted: data.datePosted !== undefined
            ? normalizeDatePosted(data.datePosted)
            : existing.datePosted ?? new Date().toISOString(),
        imageUrl: nextImageUrl || "",
    };
    const nextRows = [...rows];
    nextRows[index] = nextRow;
    await (0, googleSheetsStore_1.writeTable)(SHEET_NAME, HEADERS, nextRows);
    (0, googleSheetsStore_1.deleteCacheByPrefix)(TABLE_CACHE_PREFIX);
    return toAnnouncement(nextRow);
}
async function remove(id) {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 0);
    const target = String(id);
    const index = rows.findIndex((item) => item.id === target);
    if (index < 0)
        notFound();
    const [deleted] = rows.splice(index, 1);
    await (0, googleSheetsStore_1.writeTable)(SHEET_NAME, HEADERS, rows);
    (0, googleSheetsStore_1.deleteCacheByPrefix)(TABLE_CACHE_PREFIX);
    return toAnnouncement(deleted);
}
//# sourceMappingURL=announcementService.js.map