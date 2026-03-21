import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import FacultyPhoto from "./FacultyPhoto";
import { isLeadershipHighlight } from "@/lib/facultyBoardRoles";
import { cn } from "@/lib/utils";

export type FacultyCardProps = {
  card: FacultyCardItem;
  compact?: boolean;
  /** Dense single-row layout for public minimal list view */
  minimal?: boolean;
  /** Public board dark surface (Card / List on faculty page) */
  boardSurface?: boolean;
  /** Principal hero — larger portrait and accent treatment */
  featured?: boolean;
};

const roleMuted = "text-[0.875rem] leading-snug text-[#94a3b8]";
const deptMuted = "text-xs leading-snug text-slate-400";

/** Board surface: readable on light (muted) and dark (#94a3b8) */
const boardRoleMuted =
  "text-[11px] leading-tight text-muted-foreground sm:text-xs dark:text-[#94a3b8]";
const boardDeptMuted =
  "text-[10px] leading-tight text-muted-foreground sm:text-[11px] dark:text-slate-400";

export default function FacultyCard({
  card,
  compact = false,
  minimal = false,
  boardSurface = false,
  featured = false,
}: FacultyCardProps) {
  const isHighlighted = isLeadershipHighlight(card.role);

  if (minimal) {
    if (boardSurface) {
      return (
        <article
          className={cn(
            "h-full rounded-lg border border-border bg-card px-2 py-1.5 shadow-md transition-all duration-300 ease-out sm:px-2.5 sm:py-2",
            "hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0",
            "dark:border-white/10 dark:bg-slate-800/75 dark:hover:border-white/25",
            isHighlighted &&
              "border-primary/40 bg-primary/5 ring-1 ring-primary/20 dark:border-primary/35 dark:bg-slate-800/85 dark:ring-primary/15"
          )}
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <FacultyPhoto
              photoUrl={card.photoUrl}
              name={card.name}
              className="h-8 w-8 sm:h-9 sm:w-9"
              iconClassName="h-[38%] w-[38%]"
            />
            <div className="min-w-0 flex-1 space-y-0.5 text-left">
              <h3 className="line-clamp-2 text-base font-bold leading-tight text-foreground dark:text-white">{card.name}</h3>
              <p className={cn("line-clamp-2", boardRoleMuted)}>{card.role}</p>
              <p className={cn("line-clamp-2", boardDeptMuted)}>{card.department}</p>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article
        className={`h-full rounded-md border bg-card px-2 py-1.5 sm:px-2.5 sm:py-2 ${isHighlighted ? "border-primary/50 bg-primary/5" : "border-border"}`}
      >
        <div className="flex min-w-0 items-start gap-2">
          <FacultyPhoto photoUrl={card.photoUrl} name={card.name} className="h-8 w-8" iconClassName="h-[40%] w-[40%]" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">{card.name}</h3>
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{card.role}</p>
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground/90">{card.department}</p>
          </div>
        </div>
      </article>
    );
  }

  if (boardSurface) {
    return (
      <article
        className={cn(
          "h-auto w-full rounded-lg border border-border bg-card px-2 pt-2 pb-1.5 shadow-md backdrop-blur-sm transition-all duration-300 ease-out",
          "hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          "dark:border-white/10 dark:bg-slate-800/80 dark:hover:border-white/25",
          featured &&
            "border-primary/35 bg-primary/[0.06] px-2.5 pt-2.5 pb-1.5 shadow-lg ring-1 ring-primary/20 sm:px-2.5 sm:pt-2.5 sm:pb-1.5 dark:border-primary/40 dark:bg-slate-800/95 dark:ring-primary/25",
          isHighlighted &&
            !featured &&
            "border-primary/40 bg-primary/5 ring-1 ring-primary/20 dark:border-primary/35 dark:bg-slate-800/85 dark:ring-primary/15"
        )}
      >
        <div
          className={cn(
            "flex gap-1 text-center",
            compact ? "flex-row items-center text-left" : "flex-col items-center"
          )}
        >
          <FacultyPhoto
            photoUrl={card.photoUrl}
            name={card.name}
            className={cn(
              "border-border dark:border-white/15",
              compact ? "h-14 w-14" : featured ? "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" : "h-12 w-12"
            )}
            iconClassName={featured ? "h-[36%] w-[36%]" : "h-[40%] w-[40%]"}
          />
          <div className={cn("w-full min-w-0", compact ? "flex-1" : "")}>
            <h3 className="text-[0.8125rem] font-bold leading-tight text-foreground sm:text-sm dark:text-white">{card.name}</h3>
            <p className={cn("mt-0.5", boardRoleMuted)}>{card.role}</p>
            {!compact ? <p className={cn("mb-0 mt-0.5", boardDeptMuted)}>{card.department}</p> : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`rounded-xl border bg-card p-4 shadow-sm ${isHighlighted ? "border-primary/60 ring-1 ring-primary/30" : "border-border"}`}
    >
      <div className={`flex ${compact ? "items-center gap-3" : "flex-col items-center gap-3 text-center"}`}>
        <FacultyPhoto
          photoUrl={card.photoUrl}
          name={card.name}
          className={cn(compact ? "h-14 w-14" : "h-24 w-24")}
        />
        <div className={compact ? "flex-1" : ""}>
          <h3 className="text-base font-semibold text-foreground">{card.name}</h3>
          <p className="text-sm text-muted-foreground">{card.role}</p>
          {!compact ? <p className="mt-1 text-xs text-muted-foreground">{card.department}</p> : null}
        </div>
      </div>
    </article>
  );
}
