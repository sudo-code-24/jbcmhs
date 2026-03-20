import type { FacultyCardItem } from "@/hooks/useFacultyBoard";

export function matchesFacultySearch(card: FacultyCardItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    card.name.toLowerCase().includes(q) ||
    card.role.toLowerCase().includes(q) ||
    card.department.toLowerCase().includes(q)
  );
}

export type GroupedFacultyCards = { section: string; cards: FacultyCardItem[] };

export function filterGroupedFacultyCards(grouped: GroupedFacultyCards[], query: string): GroupedFacultyCards[] {
  const q = query.trim();
  if (!q) return grouped;
  return grouped
    .map((group) => ({
      ...group,
      cards: group.cards.filter((card) => matchesFacultySearch(card, q)),
    }))
    .filter((group) => group.cards.length > 0);
}
