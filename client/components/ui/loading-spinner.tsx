import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  className?: string;
};

/** Small inline spinner (e.g. buttons, table cells). Uses `tailwind-merge` when `className` overrides size. */
export default function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn("h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none", className)}
      aria-hidden
    />
  );
}

