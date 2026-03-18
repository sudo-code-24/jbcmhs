export const ADMIN_AUTH_COOKIE = "hs_admin_session";

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "";
}

function getAdminSessionToken(): string {
  return process.env.ADMIN_SESSION_TOKEN || getAdminPassword();
}

export function isAdminConfigValid(): boolean {
  return Boolean(getAdminPassword() && getAdminSessionToken());
}

export function validateAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  return Boolean(expected && password === expected);
}

export function isValidAdminSessionCookie(cookieValue: string | undefined): boolean {
  const token = getAdminSessionToken();
  return Boolean(token && cookieValue && cookieValue === token);
}

export function getAdminSessionTokenValue(): string {
  return getAdminSessionToken();
}
