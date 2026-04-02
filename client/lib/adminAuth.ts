/**
 * Legacy cookie names from the Express + Redis session stack.
 * Kept so logout/middleware can clear them after migrating to Strapi JWT-only auth.
 */
export const LEGACY_ADMIN_AUTH_COOKIE = "hs_admin_session";
export const LEGACY_AUTH_TOKEN_COOKIE = "hs_auth_token";
export const LEGACY_AUTH_SESSION_COOKIE = "hs_auth_session_id";
