"use client";

import { useMemo, useState } from "react";
import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import { isPrincipalCard } from "@/lib/facultyBoardRoles";
import { FacultyCardView } from "./public-board/FacultyCardView";
import { FacultyDetailModal } from "./public-board/FacultyDetailModal";
import { FacultyListView } from "./public-board/FacultyListView";
import type { FacultyGroupedSection } from "./public-board/types";

type PublicBoardProps = {
  groupedCards: FacultyGroupedSection[];
  /** Dense vertical list to reduce scrolling */
  minimal?: boolean;
};

function partitionPrincipalAndSections(groupedCards: FacultyGroupedSection[]) {
  const principals: FacultyCardItem[] = [];
  const seenPrincipalIds = new Set<string>();

  const sectionGroups: FacultyGroupedSection[] = groupedCards
    .map((group) => ({
      section: group.section,
      cards: group.cards.filter((c) => {
        if (isPrincipalCard(c)) {
          if (!seenPrincipalIds.has(c.id)) {
            seenPrincipalIds.add(c.id);
            principals.push(c);
          }
          return false;
        }
        return true;
      }),
    }))
    .filter((g) => g.cards.length > 0);

  principals.sort((a, b) => a.positionIndex - b.positionIndex);

  return { principalCards: principals, sectionGroups };
}

export default function PublicBoard({ groupedCards, minimal = false }: PublicBoardProps) {
  const [selectedCard, setSelectedCard] = useState<FacultyCardItem | null>(null);
  const [collapsedDeptIndices, setCollapsedDeptIndices] = useState<Set<number>>(
    () => new Set(),
  );

  const { principalCards, sectionGroups } = useMemo(
    () => partitionPrincipalAndSections(groupedCards),
    [groupedCards],
  );

  const openDetail = (card: FacultyCardItem) => setSelectedCard(card);
  const closeDetail = () => setSelectedCard(null);

  const toggleDepartment = (deptIndex: number) => {
    setCollapsedDeptIndices((prev) => {
      const next = new Set(prev);
      if (next.has(deptIndex)) next.delete(deptIndex);
      else next.add(deptIndex);
      return next;
    });
  };

  return (
    <>
      {minimal ? (
        <FacultyListView
          principalCards={principalCards}
          sectionGroups={sectionGroups}
          collapsedDeptIndices={collapsedDeptIndices}
          onToggleDepartment={toggleDepartment}
          onSelectCard={openDetail}
        />
      ) : (
        <FacultyCardView
          principalCards={principalCards}
          sectionGroups={sectionGroups}
          collapsedDeptIndices={collapsedDeptIndices}
          onToggleDepartment={toggleDepartment}
          onSelectCard={openDetail}
        />
      )}
      <FacultyDetailModal card={selectedCard} open={selectedCard !== null} onClose={closeDetail} />
    </>
  );
}
