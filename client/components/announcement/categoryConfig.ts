import { CalendarDays, Megaphone, Bell } from "lucide-react";
import type { CategoryConfigItem } from "./types";

export const categoryConfig: Record<string, CategoryConfigItem> = {
  General: {
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/15 dark:text-blue-200",
    button: "bg-blue-600 text-white hover:bg-blue-500",
    Icon: Megaphone,
  },
  Events: {
    badge:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/15 dark:text-violet-200",
    button: "bg-violet-600 text-white hover:bg-violet-500",
    Icon: CalendarDays,
  },
  default: {
    badge:
      "border-border bg-muted text-foreground dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
    button: "bg-slate-700 text-white hover:bg-slate-600",
    Icon: Bell,
  },
};
