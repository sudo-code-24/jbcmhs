import type { FacultyCardItem } from "@/hooks/useFacultyBoard";

/** School Principal only — excludes Vice / Assistant / Associate principals. */
export function isPrincipalCard(card: FacultyCardItem): boolean {
  const r = card.role.trim().toLowerCase();
  if (r.includes("vice") || r.includes("assistant") || r.includes("associate")) return false;
  return r.includes("principal");
}

export function isLeadershipHighlight(role: string): boolean {
  const normalized = role.toLowerCase();
  return normalized.includes("principal") || normalized.includes("head of department");
}
