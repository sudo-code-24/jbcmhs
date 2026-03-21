"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PublicBoard from "@/components/faculty/PublicBoard";
import DownloadFacultyBoardPdfButton from "@/components/faculty/DownloadFacultyBoardPdfButton";
import { useFacultyBoard } from "@/hooks/useFacultyBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { filterGroupedFacultyCards } from "@/lib/facultyBoardSearch";
import { cn } from "@/lib/utils";

export default function FacultyBoardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [minimalPublicView, setMinimalPublicView] = useState(false);
  const { groupedCards, isLoaded } = useFacultyBoard();

  const filteredGroupedCards = useMemo(
    () => filterGroupedFacultyCards(groupedCards, searchQuery),
    [groupedCards, searchQuery]
  );

  if (!isLoaded) {
    return (
      <div className="container-wide py-10">
        <p className="text-sm text-muted-foreground">Loading faculty board...</p>
      </div>
    );
  }

  return (
    <div className="container-wide py-3 sm:py-4">
      <div className="page-radial-surface text-foreground dark:text-slate-100">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4 dark:border-white/[0.06]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground dark:text-slate-50 sm:text-2xl">
              School Faculty Board
            </h1>
          </div>
        </div>

        <div className="mb-4 max-w-xl space-y-1.5">
          <Label htmlFor="faculty-search" className="text-foreground dark:text-slate-300">
            Search faculty
          </Label>
          <Input
            id="faculty-search"
            type="search"
            placeholder="Name, role, or department…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            aria-describedby="faculty-search-hint"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30 dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-sky-400/40"
          />
          <p id="faculty-search-hint" className="text-xs text-muted-foreground dark:text-slate-500">
            Matches any part of name, role, or department (not case-sensitive).
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4 dark:border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground dark:text-slate-400">Layout</span>
            <div className="inline-flex rounded-md border border-border bg-muted/40 p-0.5 shadow-inner dark:border-white/10 dark:bg-slate-950/40">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 rounded-sm px-3 text-xs font-medium",
                  !minimalPublicView
                    ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/15 dark:bg-white/12 dark:text-white dark:shadow-sm dark:hover:bg-white/18"
                    : "text-muted-foreground hover:bg-background/80 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-slate-200"
                )}
                onClick={() => setMinimalPublicView(false)}
              >
                Cards
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 rounded-sm px-3 text-xs font-medium",
                  minimalPublicView
                    ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/15 dark:bg-white/12 dark:text-white dark:shadow-sm dark:hover:bg-white/18"
                    : "text-muted-foreground hover:bg-background/80 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-slate-200"
                )}
                onClick={() => setMinimalPublicView(true)}
              >
                List view
              </Button>
            </div>
          </div>
          <DownloadFacultyBoardPdfButton
            groups={filteredGroupedCards}
            disabled={filteredGroupedCards.length === 0}
            className="border-border bg-background text-foreground hover:bg-muted dark:border-white/15 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:hover:text-white"
          />
        </div>

        {filteredGroupedCards.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground dark:border-white/10 dark:bg-slate-900/30 dark:text-slate-400">
            {searchQuery.trim()
              ? "No faculty match your search. Try a different name, role, or department."
              : "No faculty to display yet."}
          </p>
        ) : (
          <PublicBoard groupedCards={filteredGroupedCards} minimal={minimalPublicView} />
        )}
      </div>
    </div>
  );
}
