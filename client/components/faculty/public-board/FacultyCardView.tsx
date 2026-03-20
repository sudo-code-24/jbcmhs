"use client";

import { ChevronDown } from "lucide-react";
import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import FacultyCard from "../FacultyCard";
import { cn } from "@/lib/utils";
import type { FacultyGroupedSection } from "./types";
import {
  departmentHeaderButtonClass,
  facultyCardGridItemClass,
  sectionTitleClass,
  staticSectionHeadingClass,
  tileButtonClassBoard,
} from "./uiConstants";

type FacultyCardViewProps = {
  principalCards: FacultyCardItem[];
  sectionGroups: FacultyGroupedSection[];
  collapsedDeptIndices: Set<number>;
  onToggleDepartment: (deptIndex: number) => void;
  onSelectCard: (card: FacultyCardItem) => void;
};

function isDepartmentExpanded(collapsed: Set<number>, deptIndex: number) {
  return !collapsed.has(deptIndex);
}

export function FacultyCardView({
  principalCards,
  sectionGroups,
  collapsedDeptIndices,
  onToggleDepartment,
  onSelectCard,
}: FacultyCardViewProps) {
  return (
    <div className="space-y-3 md:space-y-3">
      {principalCards.length > 0 ? (
        <section className="text-center" aria-label="Principal">
          <h2 className={staticSectionHeadingClass}>Principal</h2>
          <div className="mx-auto flex w-full max-w-[12rem] flex-col items-center gap-2 sm:max-w-[13rem]">
            {principalCards.map((card) => (
              <div key={card.id} className="w-full">
                <button
                  type="button"
                  className={tileButtonClassBoard}
                  onClick={() => onSelectCard(card)}
                  aria-label={`View details for ${card.name}`}
                >
                  <FacultyCard card={card} boardSurface featured />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {sectionGroups.map((group, deptIdx) => {
        const expanded = isDepartmentExpanded(collapsedDeptIndices, deptIdx);
        const panelId = `faculty-dept-panel-${deptIdx}`;
        const headerId = `faculty-dept-header-${deptIdx}`;

        return (
          <section key={group.section} className="scroll-mt-4">
            <button
              type="button"
              id={headerId}
              className={departmentHeaderButtonClass}
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => onToggleDepartment(deptIdx)}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none dark:text-slate-400",
                  !expanded && "-rotate-90",
                )}
                aria-hidden
              />
              <span className={sectionTitleClass}>{group.section}</span>
              <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground dark:text-slate-500">
                ({group.cards.length})
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  className="flex flex-wrap items-start justify-center gap-5 pt-2 sm:gap-3"
                  aria-hidden={!expanded}
                >
                  {group.cards.map((card) => (
                    <div key={card.id} className={facultyCardGridItemClass}>
                      <button
                        type="button"
                        className={tileButtonClassBoard}
                        onClick={() => onSelectCard(card)}
                        aria-label={`View details for ${card.name}`}
                      >
                        <FacultyCard card={card} boardSurface />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
