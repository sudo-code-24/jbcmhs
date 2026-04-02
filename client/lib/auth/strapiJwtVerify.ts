import { jwtVerify, type JWTPayload } from "jose";

/** HttpOnly cookie holding Strapi Users & Permissions JWT. */
export const STRAPI_JWT_COOKIE = "hs_strapi_jwt";

function getJwtSecretBytes(): Uint8Array {
  const secret = process.env.STRAPI_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "STRAPI_JWT_SECRET or JWT_SECRET is not set — use the same value as JWT_SECRET in Strapi’s .env"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function verifyStrapiJwt(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretBytes(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

/** Edge middleware: validate signature and expiry. */
export async function verifyStrapiJwtEdge(token: string): Promise<boolean> {
  return (await verifyStrapiJwt(token)) !== null;
}
