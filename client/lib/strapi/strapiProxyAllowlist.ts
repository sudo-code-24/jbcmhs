/** First path segment after `/api/` allowed for browser GET proxy -> Strapi. */
export const STRAPI_PROXY_ROOTS = [
  "announcements",
  "announcement-categories",
  "school-events",
  "school-profile",
  "grade-levels",
  "board-sections",
  "faculty-members",
] as const;

export type StrapiProxyRoot = (typeof STRAPI_PROXY_ROOTS)[number];

export function isAllowedStrapiProxyRoot(segment: string): segment is StrapiProxyRoot {
  return (STRAPI_PROXY_ROOTS as readonly string[]).includes(segment);
}
