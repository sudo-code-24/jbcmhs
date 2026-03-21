"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type FacultyPhotoProps = {
  photoUrl?: string;
  name: string;
  /** Outer size classes (e.g. h-24 w-24) — circle includes border */
  className?: string;
  /** Icon scales with container */
  iconClassName?: string;
  /** Dialog / light surfaces */
  tone?: "dark" | "light";
};

/**
 * Faculty avatar: real photo when URL works; otherwise centered user icon at ~20% opacity.
 */
export default function FacultyPhoto({
  photoUrl,
  name,
  className,
  iconClassName,
  tone = "dark",
}: FacultyPhotoProps) {
  const [failed, setFailed] = useState(false);
  const trimmed = photoUrl?.trim();
  const showImg = Boolean(trimmed) && !failed;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border",
        tone === "dark"
          ? "border-border bg-muted/90 dark:border-white/10 dark:bg-slate-700/35"
          : "border-border bg-muted/80",
        className
      )}
    >
      {showImg ? (
        <img
          src={trimmed}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center",
            tone === "dark" ? "bg-muted dark:bg-slate-800/60" : "bg-muted"
          )}
          aria-hidden
        >
          <User
            className={cn(
              tone === "dark" ? "text-primary/25 dark:text-white/20" : "text-primary/20",
              iconClassName ?? "h-[42%] w-[42%]"
            )}
            strokeWidth={1.35}
            aria-hidden
          />
        </span>
      )}
    </div>
  );
}
