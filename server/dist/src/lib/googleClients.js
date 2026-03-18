"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpreadsheetId = getSpreadsheetId;
exports.getSheetsApi = getSheetsApi;
exports.getDriveApi = getDriveApi;
exports.getCalendarApi = getCalendarApi;
const googleapis_1 = require("googleapis");
function requiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
function getPrivateKey() {
    const fromKey = process.env.GOOGLE_PRIVATE_KEY;
    if (fromKey)
        return fromKey.replace(/\\n/g, "\n");
    const fromJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (fromJson) {
        const parsed = JSON.parse(fromJson);
        if (!parsed.private_key)
            throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing private_key");
        return parsed.private_key;
    }
    throw new Error("Missing GOOGLE_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_JSON");
}
function getClientEmail() {
    const fromEmail = process.env.GOOGLE_CLIENT_EMAIL;
    if (fromEmail)
        return fromEmail;
    const fromJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (fromJson) {
        const parsed = JSON.parse(fromJson);
        if (!parsed.client_email)
            throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email");
        return parsed.client_email;
    }
    throw new Error("Missing GOOGLE_CLIENT_EMAIL or GOOGLE_SERVICE_ACCOUNT_JSON");
}
const auth = new googleapis_1.google.auth.JWT({
    email: getClientEmail(),
    key: getPrivateKey(),
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/calendar",
    ],
});
function getSpreadsheetId() {
    return requiredEnv("GOOGLE_SPREADSHEET_ID");
}
function getSheetsApi() {
    return googleapis_1.google.sheets({ version: "v4", auth });
}
function getDriveApi() {
    return googleapis_1.google.drive({ version: "v3", auth });
}
function getCalendarApi() {
    return googleapis_1.google.calendar({ version: "v3", auth });
}
//# sourceMappingURL=googleClients.js.map