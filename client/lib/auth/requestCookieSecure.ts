/** Use for auth cookies so local HTTP dev works; HTTPS and TLS-terminated hosts still get Secure cookies. */
export function shouldUseSecureCookie(request: Request): boolean {
  if (new URL(request.url).protocol === "https:") return true;
  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return forwarded === "https";
}
