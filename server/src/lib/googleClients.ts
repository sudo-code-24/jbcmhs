import { google } from "googleapis";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getPrivateKey(): string {
  const fromKey = process.env.GOOGLE_PRIVATE_KEY;
  if (fromKey) return fromKey.replace(/\\n/g, "\n");

  const fromJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (fromJson) {
    const parsed = JSON.parse(fromJson) as { private_key?: string };
    if (!parsed.private_key) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing private_key");
    return parsed.private_key;
  }

  throw new Error("Missing GOOGLE_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_JSON");
}

function getClientEmail(): string {
  const fromEmail = process.env.GOOGLE_CLIENT_EMAIL;
  if (fromEmail) return fromEmail;

  const fromJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (fromJson) {
    const parsed = JSON.parse(fromJson) as { client_email?: string };
    if (!parsed.client_email) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email");
    return parsed.client_email;
  }

  throw new Error("Missing GOOGLE_CLIENT_EMAIL or GOOGLE_SERVICE_ACCOUNT_JSON");
}

const auth = new google.auth.JWT({
  email: getClientEmail(),
  key: getPrivateKey(),
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/calendar",
  ],
});

export function getSpreadsheetId(): string {
  return requiredEnv("GOOGLE_SPREADSHEET_ID");
}

export function getSheetsApi() {
  return google.sheets({ version: "v4", auth });
}

export function getDriveApi() {
  return google.drive({ version: "v3", auth });
}

export function getCalendarApi() {
  return google.calendar({ version: "v3", auth });
}

