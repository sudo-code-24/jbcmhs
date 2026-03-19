export const typeConfig: Record<string, string> = {
  academic:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/15 dark:text-sky-200",
  event:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/15 dark:text-violet-200",
  sports:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/15 dark:text-emerald-200",
  default:
    "border-border bg-muted text-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
};

export const getTypeStyle = (type: string): string => {
  const key = type?.toLowerCase() ?? "default";
  return typeConfig[key] ?? typeConfig.default;
};
