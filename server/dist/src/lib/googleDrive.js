"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDriveFileId = extractDriveFileId;
exports.toDriveThumbnailUrl = toDriveThumbnailUrl;
exports.toPublicImageUrl = toPublicImageUrl;
exports.normalizeImageUrl = normalizeImageUrl;
exports.assertDriveFileExists = assertDriveFileExists;
const googleClients_1 = require("./googleClients");
function extractDriveFileId(value) {
    if (!value)
        return "";
    if (!value.includes("/"))
        return value.trim();
    const patterns = [/\/file\/d\/([^/]+)/, /[?&]id=([^&]+)/];
    for (const pattern of patterns) {
        const match = value.match(pattern);
        if (match?.[1])
            return match[1];
    }
    return value.trim();
}
function trimTrailingSlash(value) {
    return value.endsWith("/") ? value.slice(0, -1) : value;
}
function getPublicApiBaseUrl() {
    const base = process.env.PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "";
    return base ? trimTrailingSlash(base) : "";
}
function toDriveThumbnailUrl(fileId, size = "w2000") {
    if (!fileId)
        return "";
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
}
function toPublicImageUrl(fileId) {
    if (!fileId)
        return "";
    const apiBase = getPublicApiBaseUrl();
    if (!apiBase)
        return toDriveThumbnailUrl(fileId);
    return `${apiBase}/api/images/${encodeURIComponent(fileId)}`;
}
/**
 * Normalize an image URL from Google Sheets (e.g. hero_image, imageUrl).
 * Converts Drive links / file IDs to the proxied public image URL.
 */
function normalizeImageUrl(value) {
    const raw = (value ?? "").trim();
    if (!raw)
        return "";
    const driveFileId = extractDriveFileId(raw);
    const isLikelyDriveSource = raw.includes("drive.google.com") ||
        raw.includes("docs.google.com") ||
        (!raw.includes("/") && /^[A-Za-z0-9_-]{20,}$/.test(raw));
    if (isLikelyDriveSource && driveFileId && !driveFileId.includes("http")) {
        return toPublicImageUrl(driveFileId);
    }
    return raw;
}
async function assertDriveFileExists(fileId) {
    if (!fileId)
        return;
    const drive = (0, googleClients_1.getDriveApi)();
    await drive.files.get({
        fileId,
        fields: "id",
        supportsAllDrives: true,
    });
}
//# sourceMappingURL=googleDrive.js.map