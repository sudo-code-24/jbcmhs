import bcrypt from "bcryptjs";
import { RowRecord, readTable, writeTable } from "../lib/googleSheetsStore";

export type UserRole = "admin" | "faculty";

export type AuthUser = {
  username: string;
  email: string;
  hashedPassword: string;
  createdAt: string;
  passwordUpdated: boolean;
  role: UserRole;
};

export type LoginResult =
  | { success: true; userEmail: string }
  | { success: false; requiresPasswordChange?: boolean };

export type PublicAuthUser = {
  username: string;
  email: string;
  createdAt: string;
  role?: UserRole;
};

const USERS_SHEET = process.env.GOOGLE_SHEET_USERS || "users";
const USERS_HEADERS = ["username", "email", "hashedPassword", "createdAt", "passwordUpdated", "role"];

const VALID_ROLES: UserRole[] = ["admin", "faculty"];
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

function badRequest(message: string): never {
  const err = new Error(message) as Error & { status: number };
  err.status = 400;
  throw err;
}

function conflict(message: string): never {
  const err = new Error(message) as Error & { status: number };
  err.status = 409;
  throw err;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isUsernameValid(username: string): boolean {
  return /^[a-z0-9._-]{3,32}$/.test(username);
}

function validateInput(email: string, password: string, username?: string): void {
  if (!isEmailValid(email)) {
    badRequest("Invalid email format");
  }
  if (username !== undefined && !isUsernameValid(username)) {
    badRequest("Username must be 3-32 chars and use only letters, numbers, dot, underscore, or hyphen");
  }
  if (password.length < 8) {
    badRequest("Password must be at least 8 characters long");
  }
}

function getDefaultAdminPassword(): string {
  return process.env.DEFAULT_ADMIN_PASSWORD || "admin12345";
}

function getResetPassword(): string {
  return process.env.DEFAULT_RESET_PASSWORD || "jbcmhs_local";
}

function parsePasswordUpdated(value: unknown): boolean {
  if (value === true || value === "true" || value === "1" || value === "yes") return true;
  return false;
}

function parseRole(value: unknown): UserRole {
  const s = String(value ?? "").trim().toLowerCase();
  if (s === "admin" || s === "faculty") return s;
  return "faculty";
}

function usernameFromEmail(email: string): string {
  const localPart = normalizeEmail(email).split("@")[0] || "";
  return normalizeUsername(localPart);
}

function toAuthUser(row: RowRecord): AuthUser {
  const rawEmail = row.email ?? "";
  const usernameFallbackSource = rawEmail || row.username || "";
  const username = normalizeUsername(row.username ?? usernameFromEmail(usernameFallbackSource));
  const email = normalizeEmail(rawEmail || `${username}@jbcmhs.local`);
  const hashedPassword = row.hashedPassword ?? row.password ?? "";
  const createdAt = row.createdAt ?? new Date().toISOString();
  const passwordUpdated = parsePasswordUpdated(row.passwordUpdated ?? row.PasswordUpdated);
  const role = parseRole(row.role);
  return {
    username,
    email,
    hashedPassword,
    createdAt,
    passwordUpdated,
    role,
  };
}

function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

function toRowRecord(user: AuthUser): RowRecord {
  return {
    username: user.username,
    email: user.email,
    hashedPassword: user.hashedPassword,
    createdAt: user.createdAt,
    passwordUpdated: user.passwordUpdated ? "true" : "false",
    role: user.role,
  };
}

function normalizeUserRows(rows: RowRecord[]): RowRecord[] {
  return rows
    .map((row) => toAuthUser(row))
    .filter((row) => row.email || row.username)
    .map((row) => toRowRecord(row));
}

async function migrateLegacyPasswords(rows: RowRecord[]): Promise<RowRecord[]> {
  let hasChanges = false;
  const migratedRows: RowRecord[] = [];

  for (const row of rows) {
    const user = toAuthUser(row);
    if (!user.email && !user.username) continue;

    const rawPassword = user.hashedPassword ?? "";
    let hashedPassword = rawPassword;
    if (rawPassword && !isBcryptHash(rawPassword)) {
      hashedPassword = await bcrypt.hash(rawPassword, BCRYPT_ROUNDS);
      hasChanges = true;
    }

    migratedRows.push(
      toRowRecord({
        ...user,
        hashedPassword,
      })
    );
  }

  if (hasChanges) {
    await writeTable(USERS_SHEET, USERS_HEADERS, migratedRows);
  }
  return migratedRows;
}

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const normalizedEmail = normalizeEmail(email);
  const rows = await readTable(USERS_SHEET, 15_000);
  const row = normalizeUserRows(rows).find((item) => normalizeEmail(item.email ?? "") === normalizedEmail);
  if (!row) return null;
  return toAuthUser(row);
}

export async function getUserByUsername(username: string): Promise<AuthUser | null> {
  const normalizedUsername = normalizeUsername(username);
  const rows = await readTable(USERS_SHEET, 15_000);
  const row = normalizeUserRows(rows).find((item) => normalizeUsername(item.username ?? "") === normalizedUsername);
  if (!row) return null;
  return toAuthUser(row);
}

export async function createUser(user: AuthUser): Promise<AuthUser> {
  const rows = normalizeUserRows(await readTable(USERS_SHEET, 0));
  const normalizedEmail = normalizeEmail(user.email);
  const normalizedUsername = normalizeUsername(user.username);
  const duplicateUsername = rows.some(
    (item) => normalizeUsername(item.username ?? usernameFromEmail(item.email ?? "")) === normalizedUsername
  );
  if (duplicateUsername) {
    conflict("Username already exists");
  }
  const duplicate = rows.some((item) => normalizeEmail(item.email ?? "") === normalizedEmail);
  if (duplicate) {
    conflict("Email already exists");
  }

  const nextRow = toRowRecord({
    username: normalizedUsername,
    email: normalizedEmail,
    hashedPassword: user.hashedPassword,
    createdAt: user.createdAt,
    passwordUpdated: user.passwordUpdated,
    role: user.role,
  });

  await writeTable(USERS_SHEET, USERS_HEADERS, [...rows, nextRow]);
  return toAuthUser(nextRow);
}

export function isValidRole(value: string): value is UserRole {
  return VALID_ROLES.includes(value as UserRole);
}

export async function signup(
  email: string,
  password: string,
  usernameInput?: string,
  roleInput: UserRole = "faculty"
): Promise<{ username: string; email: string; createdAt: string; role: UserRole }> {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(usernameInput ?? usernameFromEmail(normalizedEmail));
  validateInput(normalizedEmail, password, normalizedUsername);

  const role = isValidRole(roleInput) ? roleInput : "faculty";

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const createdAt = new Date().toISOString();
  const created = await createUser({
    username: normalizedUsername,
    email: normalizedEmail,
    hashedPassword,
    createdAt,
    passwordUpdated: false,
    role,
  });

  return {
    username: created.username,
    email: created.email,
    createdAt: created.createdAt,
    role: created.role,
  };
}

function normalizeIdentifier(input: string): string {
  return input.trim().toLowerCase();
}

export async function getUserByIdentifier(identifier: string): Promise<AuthUser | null> {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) return null;
  if (normalized.includes("@")) {
    return getUserByEmail(normalized);
  }
  return getUserByUsername(normalized);
}

export async function login(identifier: string, password: string): Promise<LoginResult> {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier || !password) {
    return { success: false };
  }

  const user = await getUserByIdentifier(normalizedIdentifier);
  if (!user || !user.hashedPassword) {
    return { success: false };
  }

  const isMatch = await bcrypt.compare(password, user.hashedPassword);
  if (!isMatch) {
    return { success: false };
  }

  if (!user.passwordUpdated) {
    return { success: false, requiresPasswordChange: true };
  }

  return { success: true, userEmail: user.email };
}

export async function changePassword(identifier: string, currentPassword: string, newPassword: string): Promise<void> {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier) {
    badRequest("User identifier is required");
  }
  const user = await getUserByIdentifier(normalizedIdentifier);
  if (!user) {
    badRequest("User not found");
  }

  validateInput(user.email, newPassword, user.username);

  const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!isMatch) {
    badRequest("Current password is incorrect");
  }

  if (newPassword === currentPassword) {
    badRequest("Use a new password different from your current password");
  }
  if (newPassword === getResetPassword()) {
    badRequest("New password cannot be the reset/default password");
  }

  const rows = await readTable(USERS_SHEET, 0);
  const normalized = rows.map((r) => toAuthUser(r));
  const index = normalized.findIndex((u) => normalizeUsername(u.username) === normalizeUsername(user.username));
  if (index < 0) {
    badRequest("User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  const updated = {
    ...user,
    hashedPassword,
    passwordUpdated: true,
  };
  const nextRows = rows.map((r, i) => (i === index ? toRowRecord(updated) : toRowRecord(toAuthUser(r))));
  await writeTable(USERS_SHEET, USERS_HEADERS, nextRows);
}

export async function listUsers(): Promise<PublicAuthUser[]> {
  const rows = await readTable(USERS_SHEET, 15_000);
  const users = rows.map((r) => toAuthUser(r)).filter((u) => u.email || u.username);
  return users
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((u) => ({ username: u.username, email: u.email, createdAt: u.createdAt, role: u.role }));
}

export async function deleteUser(username: string): Promise<void> {
  const target = normalizeUsername(username);
  if (!target) {
    badRequest("Username is required");
  }

  const defaultAdminUsername = normalizeUsername(
    process.env.DEFAULT_ADMIN_USERNAME || usernameFromEmail(process.env.DEFAULT_ADMIN_EMAIL || "admin@jbcmhs.local")
  );
  if (target === defaultAdminUsername) {
    badRequest("Default admin user cannot be deleted");
  }

  const rows = await readTable(USERS_SHEET, 0);
  const nextRows = rows
    .map((r) => toAuthUser(r))
    .filter((u) => normalizeUsername(u.username) !== target)
    .map((u) => toRowRecord(u));
  if (nextRows.length === rows.length) {
    badRequest("User not found");
  }
  await writeTable(USERS_SHEET, USERS_HEADERS, nextRows);
}

export async function resetPassword(username: string): Promise<void> {
  const target = normalizeUsername(username);
  if (!target) {
    badRequest("Username is required");
  }

  const rows = normalizeUserRows(await readTable(USERS_SHEET, 0));
  const index = rows.findIndex(
    (row) => normalizeUsername(row.username ?? usernameFromEmail(row.email ?? "")) === target
  );
  if (index < 0) {
    badRequest("User not found");
  }

  const hashedPassword = await bcrypt.hash(getResetPassword(), BCRYPT_ROUNDS);
  const existing = toAuthUser(rows[index]);
  const nextRows = rows.map((r, i) => {
    if (i === index) {
      return toRowRecord({
        ...existing,
        hashedPassword,
        passwordUpdated: false,
      });
    }
    return toRowRecord(toAuthUser(r));
  });
  await writeTable(USERS_SHEET, USERS_HEADERS, nextRows);
}

export async function ensureDefaultAdminAccount(): Promise<void> {
  const adminEmail = normalizeEmail(process.env.DEFAULT_ADMIN_EMAIL || "admin@jbcmhs.local");
  const adminUsername = normalizeUsername(
    process.env.DEFAULT_ADMIN_USERNAME || usernameFromEmail(adminEmail)
  );
  const adminPassword = getDefaultAdminPassword();

  if (!isEmailValid(adminEmail) || !isUsernameValid(adminUsername) || adminPassword.length < 8) {
    badRequest("Default admin credentials are invalid");
  }

  const rows = await readTable(USERS_SHEET, 0);
  const migratedRows = await migrateLegacyPasswords(rows);
  const existing = migratedRows
    .map((row) => toAuthUser(row))
    .find((row) => normalizeEmail(row.email) === adminEmail);
  if (existing) return;

  const hashedPassword = await bcrypt.hash(getDefaultAdminPassword(), BCRYPT_ROUNDS);
  await createUser({
    username: adminUsername,
    email: adminEmail,
    hashedPassword,
    createdAt: new Date().toISOString(),
    passwordUpdated: false,
    role: "admin",
  });
  console.log(`Default admin account created for ${adminUsername}`);
}
