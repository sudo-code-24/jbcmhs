import { getSpreadsheetId, getSheetsApi } from "./googleClients";

export type RowRecord = Record<string, string>;

export function deleteCacheKey(key: string): void {
  // No-op: server cache removed.
  void key;
}

export function deleteCacheByPrefix(prefix: string): void {
  // No-op: server cache removed.
  void prefix;
}

function toCells(record: RowRecord, headers: string[]): string[] {
  return headers.map((header) => record[header] ?? "");
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(err: unknown): boolean {
  const status = (err as { code?: number; status?: number })?.code ?? (err as { status?: number })?.status;
  const message = String((err as { message?: string })?.message ?? "");
  return (
    status === 429 ||
    (status === 403 &&
      (message.includes("rateLimitExceeded") || message.includes("userRateLimitExceeded")))
  );
}

async function withRetry<T>(op: () => Promise<T>): Promise<T> {
  const maxRetries = 4;
  for (let i = 0; ; i += 1) {
    try {
      return await op();
    } catch (err) {
      if (!isRetryableError(err) || i >= maxRetries) throw err;
      const waitMs = 1000 * 2 ** i + Math.floor(Math.random() * 300);
      await sleep(waitMs);
    }
  }
}

function normalizeHeaders(headers: string[]): string[] {
  return headers.map((header) => header.trim()).filter(Boolean);
}

export async function readTable(sheetName: string, ttlMs = 30_000): Promise<RowRecord[]> {
  void ttlMs;

  const sheets = getSheetsApi();
  const spreadsheetId = getSpreadsheetId();
  const response = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:ZZ`,
    })
  );

  const values = response.data.values ?? [];
  if (values.length === 0) {
    return [];
  }

  const headers = normalizeHeaders((values[0] ?? []).map(String));
  const rows = values.slice(1).map((row) => {
    const record: RowRecord = {};
    headers.forEach((header, index) => {
      record[header] = row[index] == null ? "" : String(row[index]);
    });
    return record;
  });

  return rows;
}

export async function writeTable(sheetName: string, headers: string[], rows: RowRecord[]): Promise<void> {
  const sheets = getSheetsApi();
  const spreadsheetId = getSpreadsheetId();
  const normalizedHeaders = normalizeHeaders(headers);
  const payload = [normalizedHeaders, ...rows.map((row) => toCells(row, normalizedHeaders))];

  await withRetry(() =>
    sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A:ZZ`,
    })
  );

  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: payload },
    })
  );

  deleteCacheKey(`sheet:${sheetName}`);
}

export function getNextNumericId(rows: RowRecord[]): number {
  const max = rows.reduce((highest, row) => {
    const id = Number.parseInt(row.id ?? "0", 10);
    if (Number.isNaN(id)) return highest;
    return Math.max(highest, id);
  }, 0);
  return max + 1;
}

