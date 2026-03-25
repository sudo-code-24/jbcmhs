"use client";

import { ChevronDown } from "lucide-react";
import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import FacultyCard from "../FacultyCard";
import { cn } from "@/lib/utils";
import type { FacultyGroupedSection } from "./types";
import {
  departmentHeaderButtonClass,
  sectionTitleClass,
  tileButtonClassBoard,
} from "./uiConstants";

type FacultyCardViewProps = {
  sectionGroups: FacultyGroupedSection[];
  collapsedDeptIndices: Set<number>;
  onToggleDepartment: (deptIndex: number) => void;
  onSelectCard: (card: FacultyCardItem) => void;
};

function isDepartmentExpanded(collapsed: Set<number>, deptIndex: number) {
  return !collapsed.has(deptIndex);
}

export function FacultyCardView({
  sectionGroups,
  collapsedDeptIndices,
  onToggleDepartment,
  onSelectCard,
}: FacultyCardViewProps) {
  return (
    <div className="space-y-3 md:space-y-3">
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
                <div className="grid gap-3 pt-2 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))] md:justify-center md:[grid-template-columns:repeat(auto-fit,minmax(280px,280px))]">
                  {group.cards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      className={`${tileButtonClassBoard} `}
                      onClick={() => onSelectCard(card)}
                      aria-label={`View details for ${card.name}`}
                    >
                      <FacultyCard card={card} boardSurface />
                    </button>
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
