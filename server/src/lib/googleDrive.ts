import { getDriveApi } from "./googleClients";

export function extractDriveFileId(value?: string): string {
  if (!value) return "";
  if (!value.includes("/")) return value.trim();

  const patterns = [/\/file\/d\/([^/]+)/, /[?&]id=([^&]+)/];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }
  return value.trim();
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getPublicApiBaseUrl(): string {
  const base = process.env.PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "";
  return base ? trimTrailingSlash(base) : "";
}

export function toDriveThumbnailUrl(fileId?: string, size = "w2000"): string {
  if (!fileId) return "";
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
}

export function toPublicImageUrl(fileId?: string): string {
  if (!fileId) return "";
  const apiBase = getPublicApiBaseUrl();
  if (!apiBase) return toDriveThumbnailUrl(fileId);
  return `${apiBase}/api/images/${encodeURIComponent(fileId)}`;
}

export async function assertDriveFileExists(fileId?: string): Promise<void> {
  if (!fileId) return;
  const drive = getDriveApi();
  await drive.files.get({
    fileId,
    fields: "id",
    supportsAllDrives: true,
  });
}

