"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  type DialogMaxWidth,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Primary message; use a `<p className="text-sm text-muted-foreground">` or fragments as needed */
  description?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  cancelVariant?: React.ComponentProps<typeof Button>["variant"];
  onConfirm: () => void;
  /**
   * Called when the user dismisses via the cancel/secondary action.
   * Defaults to `onOpenChange(false)` when omitted.
   */
  onCancel?: () => void;
  maxWidth?: DialogMaxWidth;
  /** When true, overlay click and Escape do not close the dialog */
  preventDismiss?: boolean;
  /** Corner close control on `DialogContent` (defaults to true) */
  showClose?: boolean;
  footerClassName?: string;
  contentClassName?: string;
  /** Button order in the footer (see `DialogFooter` flex rules on small vs large screens) */
  actionsOrder?: "cancel-first" | "confirm-first";
};

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmVariant = "default",
  cancelVariant = "outline",
  onConfirm,
  onCancel,
  maxWidth = "md",
  preventDismiss = false,
  showClose = true,
  footerClassName,
  contentClassName,
  actionsOrder = "cancel-first",
}: ConfirmModalProps) {
  const handleCancel = () => {
    if (onCancel) onCancel();
    else onOpenChange(false);
  };

  const cancelButton = (
    <Button type="button" variant={cancelVariant} onClick={handleCancel}>
      {cancelLabel}
    </Button>
  );

  const confirmButton = (
    <Button type="button" variant={confirmVariant} onClick={onConfirm}>
      {confirmLabel}
    </Button>
  );

  const footerActions =
    actionsOrder === "cancel-first" ? (
      <>
        {cancelButton}
        {confirmButton}
      </>
    ) : (
      <>
        {confirmButton}
        {cancelButton}
      </>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        maxWidth={maxWidth}
        showClose={showClose}
        className={contentClassName}
        {...(preventDismiss
          ? {
              onPointerDownOutside: (e) => e.preventDefault(),
              onEscapeKeyDown: (e) => e.preventDefault(),
            }
          : {})}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description ? (
          typeof description === "string" ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : (
            description
          )
        ) : null}
        <DialogFooter className={cn("gap-2 sm:gap-0", footerClassName)}>
          {footerActions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
