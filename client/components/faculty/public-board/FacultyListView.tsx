"use client";

import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import FacultyCard from "../FacultyCard";
import type { FacultyGroupedSection } from "./types";
import { staticSectionHeadingClass, tileButtonClassBoard } from "./uiConstants";

type FacultyListViewProps = {
  principalCards: FacultyCardItem[];
  sectionGroups: FacultyGroupedSection[];
  onSelectCard: (card: FacultyCardItem) => void;
};

export function FacultyListView({
  principalCards,
  sectionGroups,
  onSelectCard,
}: FacultyListViewProps) {
  return (
    <div className="space-y-3 md:space-y-3">
      {principalCards.length > 0 ? (
        <section className="text-center" aria-label="Principal">
          <h2 className={staticSectionHeadingClass}>Principal</h2>
          <div className="rounded-lg border border-border bg-muted/40 p-2">
            <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-2">
              {principalCards.map((card) => (
                <div key={card.id} className="w-full max-w-xs">
                  <button
                    type="button"
                    className={tileButtonClassBoard}
                    onClick={() => onSelectCard(card)}
                    aria-label={`View details for ${card.name}`}
                  >
                    <FacultyCard card={card} minimal boardSurface featured />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {sectionGroups.map((group) => (
        <section key={group.section} className="scroll-mt-4">
          <h2 className={staticSectionHeadingClass}>{group.section}</h2>
          <div className="rounded-lg border border-border bg-muted/40 p-2 sm:p-3 dark:border-white/5 dark:bg-slate-900/25">
            <div className="grid justify-center gap-3 [grid-template-columns:repeat(auto-fit,minmax(280px,280px))]">
              {group.cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={`${tileButtonClassBoard} w-[280px]`}
                  onClick={() => onSelectCard(card)}
                  aria-label={`View details for ${card.name}`}
                >
                  <FacultyCard card={card} minimal boardSurface />
                </button>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
