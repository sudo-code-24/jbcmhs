export const sectionTitleClass =
  "text-[11px] font-semibold uppercase tracking-[0.05em] text-primary dark:text-slate-300";

/** Non-collapsible section labels (Principal, list view) */
export const staticSectionHeadingClass = `${sectionTitleClass} mb-3 block text-center text-muted-foreground dark:text-slate-400 md:mb-4`;

export const departmentHeaderButtonClass =
  "mb-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-muted/70 px-3 py-2 text-center transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:mb-3 dark:border-white/[0.08] dark:bg-slate-900/40 dark:hover:bg-slate-900/55 dark:focus-visible:ring-primary/50 dark:focus-visible:ring-offset-slate-950";

export const tileButtonClassBoard =
  "group w-full cursor-pointer rounded-lg border-0 bg-transparent p-0 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-slate-950";

/** Card layout: up to 3 per row (lg+), 2 on sm–md, 1 on narrow; last row stays centered */
export const facultyCardGridItemClass =
  "min-w-0 flex-[0_1_100%] max-w-[min(100%,11rem)] sm:flex-[0_1_calc(50%-0.375rem)] sm:max-w-[calc(50%-0.375rem)] lg:flex-[0_1_calc(33.333%-0.5rem)] lg:max-w-[calc(33.333%-0.5rem)]";
