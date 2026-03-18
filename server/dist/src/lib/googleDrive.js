"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDriveFileId = extractDriveFileId;
exports.toDriveThumbnailUrl = toDriveThumbnailUrl;
exports.toPublicImageUrl = toPublicImageUrl;
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