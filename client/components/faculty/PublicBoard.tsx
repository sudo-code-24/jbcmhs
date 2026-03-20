"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import FacultyCard from "./FacultyCard";
import FacultyPhoto from "./FacultyPhoto";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isPrincipalCard } from "@/lib/facultyBoardRoles";
import { cn } from "@/lib/utils";

type GroupedCards = {
  section: string;
  cards: FacultyCardItem[];
};

type PublicBoardProps = {
  groupedCards: GroupedCards[];
  /** Dense vertical list to reduce scrolling */
  minimal?: boolean;
};

function FacultyDetailModal({
  card,
  open,
  onClose,
}: {
  card: FacultyCardItem | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent maxWidth="lg">
        <DialogHeader>
          <DialogTitle>{card?.name ?? "Faculty"}</DialogTitle>
        </DialogHeader>
        {card ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <FacultyPhoto
              photoUrl={card.photoUrl}
              name={card.name}
              tone="light"
              className="mx-auto h-32 w-32 shrink-0 sm:mx-0 sm:h-36 sm:w-36"
              iconClassName="h-[40%] w-[40%]"
            />
            <dl className="min-w-0 flex-1 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</dt>
                <dd className="mt-0.5 font-medium text-foreground">{card.role}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Department</dt>
                <dd className="mt-0.5 text-foreground">{card.department}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Row / section</dt>
                <dd className="mt-0.5 text-foreground">{card.boardSection}</dd>
              </div>
              {card.email ? (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
                  <dd className="mt-0.5 break-all">
                    <a href={`mailto:${card.email}`} className="text-primary underline-offset-4 hover:underline">
                      {card.email}
                    </a>
                  </dd>
                </div>
              ) : (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
                  <dd className="mt-0.5 text-muted-foreground">—</dd>
                </div>
              )}
              {card.phone ? (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</dt>
                  <dd className="mt-0.5">
                    <a href={`tel:${card.phone.replace(/\s/g, "")}`} className="text-primary underline-offset-4 hover:underline">
                      {card.phone}
                    </a>
                  </dd>
                </div>
              ) : (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</dt>
                  <dd className="mt-0.5 text-muted-foreground">—</dd>
                </div>
              )}
            </dl>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

const sectionTitleClass =
  "text-[11px] font-semibold uppercase tracking-[0.05em] text-primary dark:text-slate-300";

/** Non-collapsible section labels (Principal, list view) */
const staticSectionHeadingClass = `${sectionTitleClass} mb-3 block text-center text-muted-foreground dark:text-slate-400 md:mb-4`;

const departmentHeaderButtonClass =
  "mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted/70 px-3 py-2 text-center transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:mb-3 dark:border-white/[0.08] dark:bg-slate-900/40 dark:hover:bg-slate-900/55 dark:focus-visible:ring-primary/50 dark:focus-visible:ring-offset-slate-950";

const tileButtonClassBoard =
  "group w-full cursor-pointer rounded-lg border-0 bg-transparent p-0 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-950";

export default function PublicBoard({ groupedCards, minimal = false }: PublicBoardProps) {
  const [selectedCard, setSelectedCard] = useState<FacultyCardItem | null>(null);
  /** Department row indices collapsed in card view — empty = all expanded */
  const [collapsedDeptIndices, setCollapsedDeptIndices] = useState<Set<number>>(() => new Set());

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

  const isDepartmentExpanded = (deptIndex: number) => !collapsedDeptIndices.has(deptIndex);

  const { principalCards, sectionGroups } = useMemo(() => {
    const principals: FacultyCardItem[] = [];
    const seenPrincipalIds = new Set<string>();

    const rest: GroupedCards[] = groupedCards.map((group) => ({
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
    })).filter((g) => g.cards.length > 0);

    principals.sort((a, b) => a.positionIndex - b.positionIndex);

    return { principalCards: principals, sectionGroups: rest };
  }, [groupedCards]);

  if (minimal) {
    return (
      <>
        <div className="space-y-6 md:space-y-7">
          {principalCards.length > 0 ? (
            <section className="text-center" aria-label="Principal">
              <h2 className={staticSectionHeadingClass}>Principal</h2>
              <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-2">
                {principalCards.map((card) => (
                  <div key={card.id} className="w-full max-w-xs">
                    <button
                      type="button"
                      className={tileButtonClassBoard}
                      onClick={() => openDetail(card)}
                      aria-label={`View details for ${card.name}`}
                    >
                      <FacultyCard card={card} minimal boardSurface featured />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {sectionGroups.map((group) => (
            <section key={group.section} className="scroll-mt-4">
              <h2 className={staticSectionHeadingClass}>{group.section}</h2>
              <div className="rounded-lg border border-border bg-muted/40 p-2 sm:p-3 dark:border-white/5 dark:bg-slate-900/25">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-3">
                  {group.cards.map((card) => (
                    <div key={card.id} className="min-w-0">
                      <button
                        type="button"
                        className={tileButtonClassBoard}
                        onClick={() => openDetail(card)}
                        aria-label={`View details for ${card.name}`}
                      >
                        <FacultyCard card={card} minimal boardSurface />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
        <FacultyDetailModal card={selectedCard} open={selectedCard !== null} onClose={closeDetail} />
      </>
    );
  }

  return (
    <>
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
                    onClick={() => openDetail(card)}
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
          const expanded = isDepartmentExpanded(deptIdx);
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
                onClick={() => toggleDepartment(deptIdx)}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none dark:text-slate-400",
                    !expanded && "-rotate-90"
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
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className="grid grid-cols-2 items-start justify-items-stretch gap-2 pb-1 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-3 lg:grid-cols-5 xl:grid-cols-6"
                    aria-hidden={!expanded}
                  >
                    {group.cards.map((card) => (
                      <div key={card.id} className="min-w-0">
                        <button
                          type="button"
                          className={tileButtonClassBoard}
                          onClick={() => openDetail(card)}
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
      <FacultyDetailModal card={selectedCard} open={selectedCard !== null} onClose={closeDetail} />
    </>
  );
}
