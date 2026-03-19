export declare function extractDriveFileId(value?: string): string;
export declare function toDriveThumbnailUrl(fileId?: string, size?: string): string;
export declare function toPublicImageUrl(fileId?: string): string;
/**
 * Normalize an image URL from Google Sheets (e.g. hero_image, imageUrl).
 * Converts Drive links / file IDs to the proxied public image URL.
 */
export declare function normalizeImageUrl(value?: string): string;
export declare function assertDriveFileExists(fileId?: string): Promise<void>;
//# sourceMappingURL=googleDrive.d.ts.map