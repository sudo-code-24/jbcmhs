"use client";

import { useState } from "react";
import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import { FacultyCardView } from "./public-board/FacultyCardView";
import { FacultyDetailModal } from "./public-board/FacultyDetailModal";
import { FacultyListView } from "./public-board/FacultyListView";
import type { FacultyGroupedSection } from "./public-board/types";

type PublicBoardProps = {
  groupedCards: FacultyGroupedSection[];
  /** Dense vertical list to reduce scrolling */
  minimal?: boolean;
};

export default function PublicBoard({ groupedCards, minimal = false }: PublicBoardProps) {
  const [selectedCard, setSelectedCard] = useState<FacultyCardItem | null>(null);
  const [collapsedDeptIndices, setCollapsedDeptIndices] = useState<Set<number>>(
    () => new Set(),
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
          sectionGroups={groupedCards}
          collapsedDeptIndices={collapsedDeptIndices}
          onToggleDepartment={toggleDepartment}
          onSelectCard={openDetail}
        />
      ) : (
        <FacultyCardView
          sectionGroups={groupedCards}
          collapsedDeptIndices={collapsedDeptIndices}
          onToggleDepartment={toggleDepartment}
          onSelectCard={openDetail}
        />
      )}
      <FacultyDetailModal card={selectedCard} open={selectedCard !== null} onClose={closeDetail} />
    </>
  );
}
