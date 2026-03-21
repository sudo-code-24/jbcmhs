"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

export type LoadingButtonProps = Omit<ButtonProps, "asChild"> & {
  /** When true, shows a spinner and disables the button. */
  loading?: boolean;
};

/**
 * Button with built-in loading state (spinner + disabled). Prefer this over duplicating Loader2 markup.
 */
const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, loading = false, disabled, children, type = "button", ...props }, ref) => (
    <Button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn("inline-flex items-center justify-center gap-2", className)}
      {...props}
    >
      {loading ? <LoadingSpinner /> : null}
      {children}
    </Button>
  )
);
LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
