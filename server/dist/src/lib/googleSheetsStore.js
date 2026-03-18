"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCacheKey = deleteCacheKey;
exports.deleteCacheByPrefix = deleteCacheByPrefix;
exports.readTable = readTable;
exports.writeTable = writeTable;
exports.getNextNumericId = getNextNumericId;
const googleClients_1 = require("./googleClients");
function deleteCacheKey(key) {
    // No-op: server cache removed.
    void key;
}
function deleteCacheByPrefix(prefix) {
    // No-op: server cache removed.
    void prefix;
}
function toCells(record, headers) {
    return headers.map((header) => record[header] ?? "");
}
async function sleep(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}
function isRetryableError(err) {
    const status = err?.code ?? err?.status;
    const message = String(err?.message ?? "");
    return (status === 429 ||
        (status === 403 &&
            (message.includes("rateLimitExceeded") || message.includes("userRateLimitExceeded"))));
}
async function withRetry(op) {
    const maxRetries = 4;
    for (let i = 0;; i += 1) {
        try {
            return await op();
        }
        catch (err) {
            if (!isRetryableError(err) || i >= maxRetries)
                throw err;
            const waitMs = 1000 * 2 ** i + Math.floor(Math.random() * 300);
            await sleep(waitMs);
        }
    }
}
function normalizeHeaders(headers) {
    return headers.map((header) => header.trim()).filter(Boolean);
}
async function readTable(sheetName, ttlMs = 30000) {
    void ttlMs;
    const sheets = (0, googleClients_1.getSheetsApi)();
    const spreadsheetId = (0, googleClients_1.getSpreadsheetId)();
    const response = await withRetry(() => sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:ZZ`,
    }));
    const values = response.data.values ?? [];
    if (values.length === 0) {
        return [];
    }
    const headers = normalizeHeaders((values[0] ?? []).map(String));
    const rows = values.slice(1).map((row) => {
        const record = {};
        headers.forEach((header, index) => {
            record[header] = row[index] == null ? "" : String(row[index]);
        });
        return record;
    });
    return rows;
}
async function writeTable(sheetName, headers, rows) {
    const sheets = (0, googleClients_1.getSheetsApi)();
    const spreadsheetId = (0, googleClients_1.getSpreadsheetId)();
    const normalizedHeaders = normalizeHeaders(headers);
    const payload = [normalizedHeaders, ...rows.map((row) => toCells(row, normalizedHeaders))];
    await withRetry(() => sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A:ZZ`,
    }));
    await withRetry(() => sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: payload },
    }));
    deleteCacheKey(`sheet:${sheetName}`);
}
function getNextNumericId(rows) {
    const max = rows.reduce((highest, row) => {
        const id = Number.parseInt(row.id ?? "0", 10);
        if (Number.isNaN(id))
            return highest;
        return Math.max(highest, id);
    }, 0);
    return max + 1;
}
//# sourceMappingURL=googleSheetsStore.js.map