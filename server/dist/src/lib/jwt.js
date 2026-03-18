"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtExpiresInSeconds = getJwtExpiresInSeconds;
exports.signAuthToken = signAuthToken;
exports.verifyAuthToken = verifyAuthToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN_SECONDS = Number(process.env.JWT_EXPIRES_IN_SECONDS || 60 * 60);
function ensureSecret() {
    if (!JWT_SECRET) {
        throw new Error("Missing required environment variable: JWT_SECRET");
    }
    return JWT_SECRET;
}
function getJwtExpiresInSeconds() {
    return JWT_EXPIRES_IN_SECONDS;
}
function signAuthToken(email) {
    const payload = {
        email,
        issuedAt: Math.floor(Date.now() / 1000),
    };
    return jsonwebtoken_1.default.sign(payload, ensureSecret(), {
        expiresIn: JWT_EXPIRES_IN_SECONDS,
    });
}
function verifyAuthToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, ensureSecret());
    const email = typeof decoded.email === "string" ? decoded.email : "";
    const issuedAt = typeof decoded.issuedAt === "number" ? decoded.issuedAt : 0;
    if (!email || !issuedAt) {
        const err = new Error("Invalid token payload");
        err.status = 401;
        throw err;
    }
    return { email, issuedAt };
}
//# sourceMappingURL=jwt.js.map