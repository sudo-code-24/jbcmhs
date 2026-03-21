"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type CollapsiblePanelProps = {
  id: string;
  /** Element id of the control that labels this region (usually the toggle button). */
  labelledBy: string;
  open: boolean;
  children: React.ReactNode;
  className?: string;
};

/**
 * Animated expand/collapse using CSS grid rows (0fr ↔ 1fr).
 * When closed, sets `inert` on inner content so focus cannot reach hidden controls.
 */
export function CollapsiblePanel({
  id,
  labelledBy,
  open,
  children,
  className,
}: CollapsiblePanelProps) {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (!open) {
      el.setAttribute("inert", "");
    } else {
      el.removeAttribute("inert");
    }
  }, [open]);

  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      aria-hidden={!open}
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div ref={innerRef} className={cn(className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
