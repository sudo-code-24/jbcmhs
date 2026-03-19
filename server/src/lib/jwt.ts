import jwt from "jsonwebtoken";

export type UserRole = "admin" | "faculty";

export type AuthJwtPayload = {
  email: string;
  issuedAt: number;
  role?: UserRole;
};

type JwtPayloadInternal = AuthJwtPayload & jwt.JwtPayload;

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN_SECONDS = Number(process.env.JWT_EXPIRES_IN_SECONDS || 60 * 60);

function ensureSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
  return JWT_SECRET;
}

export function getJwtExpiresInSeconds(): number {
  return JWT_EXPIRES_IN_SECONDS;
}

export function signAuthToken(email: string, role?: UserRole): string {
  const payload: AuthJwtPayload = {
    email,
    issuedAt: Math.floor(Date.now() / 1000),
    ...(role && { role }),
  };

  return jwt.sign(payload, ensureSecret(), {
    expiresIn: JWT_EXPIRES_IN_SECONDS,
  });
}

export function verifyAuthToken(token: string): AuthJwtPayload {
  const decoded = jwt.verify(token, ensureSecret()) as JwtPayloadInternal;
  const email = typeof decoded.email === "string" ? decoded.email : "";
  const issuedAt = typeof decoded.issuedAt === "number" ? decoded.issuedAt : 0;
  if (!email || !issuedAt) {
    const err = new Error("Invalid token payload") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  const role =
    decoded.role === "admin" || decoded.role === "faculty" ? decoded.role : ("faculty" as UserRole);
  return { email, issuedAt, role };
}
