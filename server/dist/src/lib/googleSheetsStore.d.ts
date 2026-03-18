export type RowRecord = Record<string, string>;
export declare function deleteCacheKey(key: string): void;
export declare function deleteCacheByPrefix(prefix: string): void;
export declare function readTable(sheetName: string, ttlMs?: number): Promise<RowRecord[]>;
export declare function writeTable(sheetName: string, headers: string[], rows: RowRecord[]): Promise<void>;
export declare function getNextNumericId(rows: RowRecord[]): number;
//# sourceMappingURL=googleSheetsStore.d.ts.map