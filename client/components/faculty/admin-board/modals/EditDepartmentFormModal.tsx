"use client";

import type { FormEvent } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FACULTY_MODAL_FIELD_GROUP_CLASS } from "../formLayout";

export type EditDepartmentFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  error: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isBusy?: boolean;
};

export function EditDepartmentFormModal({
  open,
  onOpenChange,
  name,
  onNameChange,
  error,
  onSubmit,
  onCancel,
  isBusy = false,
}: EditDepartmentFormModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isBusy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent maxWidth="lg">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <fieldset disabled={isBusy} className="min-w-0 space-y-4 border-0 p-0">
          <div className={FACULTY_MODAL_FIELD_GROUP_CLASS}>
            <Label htmlFor="edit-row-name" className="text-foreground">
              Department name
            </Label>
            <Input
              id="edit-row-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <LoadingButton type="submit" loading={isBusy}>
              Save row
            </LoadingButton>
          </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
