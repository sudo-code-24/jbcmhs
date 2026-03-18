"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = get;
exports.upsert = upsert;
const googleDrive_1 = require("../lib/googleDrive");
const googleSheetsStore_1 = require("../lib/googleSheetsStore");
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
function notFound() {
    const err = new Error("School info not found");
    err.status = 404;
    throw err;
}
function normalizeImageUrl(value) {
    const raw = (value ?? "").trim();
    if (!raw)
        return "";
    const driveFileId = (0, googleDrive_1.extractDriveFileId)(raw);
    const isLikelyDriveSource = raw.includes("drive.google.com") ||
        raw.includes("docs.google.com") ||
        (!raw.includes("/") && /^[A-Za-z0-9_-]{20,}$/.test(raw));
    if (isLikelyDriveSource && driveFileId && !driveFileId.includes("http")) {
        return (0, googleDrive_1.toPublicImageUrl)(driveFileId);
    }
    return raw;
}
function toSchoolInfo(row) {
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
async function get() {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 300000);
    if (!rows.length)
        notFound();
    return toSchoolInfo(rows[0]);
}
async function upsert(data) {
    const rows = await (0, googleSheetsStore_1.readTable)(SHEET_NAME, 0);
    const current = rows[0] ?? { id: "1" };
    const next = {
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
    await (0, googleSheetsStore_1.writeTable)(SHEET_NAME, HEADERS, [next]);
    (0, googleSheetsStore_1.deleteCacheByPrefix)(TABLE_CACHE_PREFIX);
    return toSchoolInfo(next);
}
//# sourceMappingURL=schoolInfoService.js.map