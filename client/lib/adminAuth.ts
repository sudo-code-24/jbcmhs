export const ADMIN_AUTH_COOKIE = "hs_admin_session";
export const AUTH_TOKEN_COOKIE = "hs_auth_token";
export const AUTH_SESSION_COOKIE = "hs_auth_session_id";

function getAdminSessionToken(): string {
  return process.env.ADMIN_SESSION_TOKEN || "dev-admin-session-token";
}

export function isAdminConfigValid(): boolean {
  return Boolean(getAdminSessionToken());
}

export function isValidAdminSessionCookie(cookieValue: string | undefined): boolean {
  const token = getAdminSessionToken();
  return Boolean(token && cookieValue && cookieValue === token);
}

export function getAdminSessionTokenValue(): string {
  return getAdminSessionToken();
}
