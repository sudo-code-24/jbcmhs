"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByEmail = getUserByEmail;
exports.getUserByUsername = getUserByUsername;
exports.createUser = createUser;
exports.isValidRole = isValidRole;
exports.signup = signup;
exports.getUserByIdentifier = getUserByIdentifier;
exports.login = login;
exports.changePassword = changePassword;
exports.listUsers = listUsers;
exports.deleteUser = deleteUser;
exports.resetPassword = resetPassword;
exports.ensureDefaultAdminAccount = ensureDefaultAdminAccount;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const googleSheetsStore_1 = require("../lib/googleSheetsStore");
const USERS_SHEET = process.env.GOOGLE_SHEET_USERS || "users";
const USERS_HEADERS = ["username", "email", "hashedPassword", "createdAt", "passwordUpdated", "role"];
const VALID_ROLES = ["admin", "faculty"];
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
function badRequest(message) {
    const err = new Error(message);
    err.status = 400;
    throw err;
}
function conflict(message) {
    const err = new Error(message);
    err.status = 409;
    throw err;
}
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function normalizeUsername(username) {
    return username.trim().toLowerCase();
}
function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isUsernameValid(username) {
    return /^[a-z0-9._-]{3,32}$/.test(username);
}
function validateInput(email, password, username) {
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
function getDefaultAdminPassword() {
    return process.env.DEFAULT_ADMIN_PASSWORD || "admin12345";
}
function getResetPassword() {
    return process.env.DEFAULT_RESET_PASSWORD || "jbcmhs_local";
}
function parsePasswordUpdated(value) {
    if (value === true || value === "true" || value === "1" || value === "yes")
        return true;
    return false;
}
function parseRole(value) {
    const s = String(value ?? "").trim().toLowerCase();
    if (s === "admin" || s === "faculty")
        return s;
    return "faculty";
}
function usernameFromEmail(email) {
    const localPart = normalizeEmail(email).split("@")[0] || "";
    return normalizeUsername(localPart);
}
function toAuthUser(row) {
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
function isBcryptHash(value) {
    return /^\$2[aby]\$\d{2}\$/.test(value);
}
function toRowRecord(user) {
    return {
        username: user.username,
        email: user.email,
        hashedPassword: user.hashedPassword,
        createdAt: user.createdAt,
        passwordUpdated: user.passwordUpdated ? "true" : "false",
        role: user.role,
    };
}
function normalizeUserRows(rows) {
    return rows
        .map((row) => toAuthUser(row))
        .filter((row) => row.email || row.username)
        .map((row) => toRowRecord(row));
}
async function migrateLegacyPasswords(rows) {
    let hasChanges = false;
    const migratedRows = [];
    for (const row of rows) {
        const user = toAuthUser(row);
        if (!user.email && !user.username)
            continue;
        const rawPassword = user.hashedPassword ?? "";
        let hashedPassword = rawPassword;
        if (rawPassword && !isBcryptHash(rawPassword)) {
            hashedPassword = await bcryptjs_1.default.hash(rawPassword, BCRYPT_ROUNDS);
            hasChanges = true;
        }
        migratedRows.push(toRowRecord({
            ...user,
            hashedPassword,
        }));
    }
    if (hasChanges) {
        await (0, googleSheetsStore_1.writeTable)(USERS_SHEET, USERS_HEADERS, migratedRows);
    }
    return migratedRows;
}
async function getUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    const rows = await (0, googleSheetsStore_1.readTable)(USERS_SHEET, 15000);
    const row = normalizeUserRows(rows).find((item) => normalizeEmail(item.email ?? "") === normalizedEmail);
    if (!row)
        return null;
    return toAuthUser(row);
}
async function getUserByUsername(username) {
    const normalizedUsername = normalizeUsername(username);
    const rows = await (0, googleSheetsStore_1.readTable)(USERS_SHEET, 15000);
    const row = normalizeUserRows(rows).find((item) => normalizeUsername(item.username ?? "") === normalizedUsername);
    if (!row)
        return null;
    return toAuthUser(row);
}
async function createUser(user) {
    const rows = normalizeUserRows(await (0, googleSheetsStore_1.readTable)(USERS_SHEET, 0));
    const normalizedEmail = normalizeEmail(user.email);
    const normalizedUsername = normalizeUsername(user.username);
    const duplicateUsername = rows.some((item) => normalizeUsername(item.username ?? usernameFromEmail(item.email ?? "")) === normalizedUsername);
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
    await (0, googleSheetsStore_1.writeTable)(USERS_SHEET, USERS_HEADERS, [...rows, nextRow]);
    return toAuthUser(nextRow);
}
function isValidRole(value) {
    return VALID_ROLES.includes(value);
}
async function signup(email, password, usernameInput, roleInput = "faculty") {
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(usernameInput ?? usernameFromEmail(normalizedEmail));
    validateInput(normalizedEmail, password, normalizedUsername);
    const role = isValidRole(roleInput) ? roleInput : "faculty";
    const hashedPassword = await bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
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
function normalizeIdentifier(input) {
    return input.trim().toLowerCase();
}
async function getUserByIdentifier(identifier) {
    const normalized = normalizeIdentifier(identifier);
    if (!normalized)
        return null;
    if (normalized.includes("@")) {
        return getUserByEmail(normalized);
    }
    return getUserByUsername(normalized);
}
async function login(identifier, password) {
    const normalizedIdentifier = normalizeIdentifier(identifier);
    if (!normalizedIdentifier || !password) {
        return { success: false };
    }
    const user = await getUserByIdentifier(normalizedIdentifier);
    if (!user || !user.hashedPassword) {
        return { success: false };
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.hashedPassword);
    if (!isMatch) {
        return { success: false };
    }
    if (!user.passwordUpdated) {
        return { success: false, requiresPasswordChange: true };
    }
    return { success: true, userEmail: user.email };
}
async function changePassword(identifier, currentPassword, newPassword) {
    const normalizedIdentifier = normalizeIdentifier(identifier);
    if (!normalizedIdentifier) {
        badRequest("User identifier is required");
    }
    const user = await getUserByIdentifier(normalizedIdentifier);
    if (!user) {
        badRequest("User not found");
    }
    validateInput(user.email, newPassword, user.username);
    const isMatch = await bcryptjs_1.default.compare(currentPassword, user.hashedPassword);
    if (!isMatch) {
        badRequest("Current password is incorrect");
    }
    if (newPassword === currentPassword) {
        badRequest("Use a new password different from your current password");
    }
    if (newPassword === getResetPassword()) {
        badRequest("New password cannot be the reset/default password");
    }
    const rows = await (0, googleSheetsStore_1.readTable)(USERS_SHEET, 0);
    const normalized = rows.map((r) => toAuthUser(r));
    const index = normalized.findIndex((u) => normalizeUsername(u.username) === normalizeUsername(user.username));
    if (index < 0) {
        badRequest("User not found");
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, BCRYPT_ROUNDS);
    const updated = {
        ...user,
        hashedPassword,
        passwordUpdated: true,
    };
    const nextRows = rows.map((r, i) => (i === index ? toRowRecord(updated) : toRowRecord(toAuthUser(r))));
    await (0, googleSheetsStore_1.writeTable)(USERS_SHEET, USERS_HEADERS, nextRows);
}
async function listUsers() {
    const rows = await (0, googleSheetsStore_1.readTable)(USERS_SHEET, 15000);
    const users = rows.map((r) => toAuthUser(r)).filter((u) => u.email || u.username);
    return users
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((u) => ({ username: u.username, email: u.email, createdAt: u.createdAt, role: u.role }));
}
async function deleteUser(username) {
    const target = normalizeUsername(username);
    if (!target) {
        badRequest("Username is required");
    }
    const defaultAdminUsername = normalizeUsername(process.env.DEFAULT_ADMIN_USERNAME || usernameFromEmail(process.env.DEFAULT_ADMIN_EMAIL || "admin@jbcmhs.local"));
    if (target === defaultAdminUsername) {
        badRequest("Default admin user cannot be deleted");
    }
    const rows = await (0, googleSheetsStore_1.readTable)(USERS_SHEET, 0);
    const nextRows = rows
        .map((r) => toAuthUser(r))
        .filter((u) => normalizeUsername(u.username) !== target)
        .map((u) => toRowRecord(u));
    if (nextRows.length === rows.length) {
        badRequest("User not found");
    }
    await (0, googleSheetsStore_1.writeTable)(USERS_SHEET, USERS_HEADERS, nextRows);
}
async function resetPassword(username) {
    const target = normalizeUsername(username);
    if (!target) {
        badRequest("Username is required");
    }
    const rows = normalizeUserRows(await (0, googleSheetsStore_1.readTable)(USERS_SHEET, 0));
    const index = rows.findIndex((row) => normalizeUsername(row.username ?? usernameFromEmail(row.email ?? "")) === target);
    if (index < 0) {
        badRequest("User not found");
    }
    const hashedPassword = await bcryptjs_1.default.hash(getResetPassword(), BCRYPT_ROUNDS);
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
    await (0, googleSheetsStore_1.writeTable)(USERS_SHEET, USERS_HEADERS, nextRows);
}
async function ensureDefaultAdminAccount() {
    const adminEmail = normalizeEmail(process.env.DEFAULT_ADMIN_EMAIL || "admin@jbcmhs.local");
    const adminUsername = normalizeUsername(process.env.DEFAULT_ADMIN_USERNAME || usernameFromEmail(adminEmail));
    const adminPassword = getDefaultAdminPassword();
    if (!isEmailValid(adminEmail) || !isUsernameValid(adminUsername) || adminPassword.length < 8) {
        badRequest("Default admin credentials are invalid");
    }
    const rows = await (0, googleSheetsStore_1.readTable)(USERS_SHEET, 0);
    const migratedRows = await migrateLegacyPasswords(rows);
    const existing = migratedRows
        .map((row) => toAuthUser(row))
        .find((row) => normalizeEmail(row.email) === adminEmail);
    if (existing)
        return;
    const hashedPassword = await bcryptjs_1.default.hash(getDefaultAdminPassword(), BCRYPT_ROUNDS);
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
//# sourceMappingURL=authService.js.map