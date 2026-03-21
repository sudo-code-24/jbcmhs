"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import { sortLeadershipHighlightFirst } from "@/lib/facultyBoardRoles";
import FacultyCard from "../FacultyCard";
import { cn } from "@/lib/utils";
import type { FacultyGroupedSection } from "./types";
import {
  departmentHeaderButtonClass,
  sectionTitleClass,
  tileButtonClassBoard,
} from "./uiConstants";

type FacultyListViewProps = {
  principalCards: FacultyCardItem[];
  sectionGroups: FacultyGroupedSection[];
  collapsedDeptIndices: Set<number>;
  onToggleDepartment: (deptIndex: number) => void;
  onSelectCard: (card: FacultyCardItem) => void;
};

function isDepartmentExpanded(collapsed: Set<number>, deptIndex: number) {
  return !collapsed.has(deptIndex);
}

export function FacultyListView({
  principalCards,
  sectionGroups,
  collapsedDeptIndices,
  onToggleDepartment,
  onSelectCard,
}: FacultyListViewProps) {
  const [principalCollapsed, setPrincipalCollapsed] = useState(false);
  const principalExpanded = !principalCollapsed;
  const principalPanelId = "faculty-list-principal-panel";
  const principalHeaderId = "faculty-list-principal-header";

  return (
    <div className="space-y-3 md:space-y-3">
      {principalCards.length > 0 ? (
        <section className="scroll-mt-4" aria-label="Principal">
          <button
            type="button"
            id={principalHeaderId}
            className={departmentHeaderButtonClass}
            aria-expanded={principalExpanded}
            aria-controls={principalPanelId}
            onClick={() => setPrincipalCollapsed((v) => !v)}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none dark:text-slate-400",
                !principalExpanded && "-rotate-90",
              )}
              aria-hidden
            />
            <span className={sectionTitleClass}>Principal</span>
            <span className="text-[10px] font-normal normal-case tracking-normal text-muted-foreground dark:text-slate-500">
              ({principalCards.length})
            </span>
          </button>
          <div
            id={principalPanelId}
            role="region"
            aria-labelledby={principalHeaderId}
            className={cn(
              "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
              principalExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="rounded-lg border border-border bg-muted/40 p-2">
                <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-2">
                  {sortLeadershipHighlightFirst(principalCards).map((card) => (
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
            </div>
          </div>
        </section>
      ) : null}

      {sectionGroups.map((group, deptIdx) => {
        const expanded = isDepartmentExpanded(collapsedDeptIndices, deptIdx);
        const panelId = `faculty-list-dept-panel-${deptIdx}`;
        const headerId = `faculty-list-dept-header-${deptIdx}`;

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
                <div className="rounded-lg border border-border bg-muted/40 p-2 sm:p-3 dark:border-white/5 dark:bg-slate-900/25">
                  <div className="grid gap-2 pt-2 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))] md:justify-center md:[grid-template-columns:repeat(auto-fit,minmax(280px,280px))]">
                    {sortLeadershipHighlightFirst(group.cards).map((card) => (
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
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
