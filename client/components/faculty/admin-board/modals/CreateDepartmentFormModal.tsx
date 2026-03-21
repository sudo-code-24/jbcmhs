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

export type CreateDepartmentFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  /** Disables submit while faculty board is saving to the server */
  isBusy?: boolean;
};

export function CreateDepartmentFormModal({
  open,
  onOpenChange,
  name,
  onNameChange,
  onSubmit,
  isBusy = false,
}: CreateDepartmentFormModalProps) {
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
          <DialogTitle>Create New Department</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className={FACULTY_MODAL_FIELD_GROUP_CLASS}>
            <Label htmlFor="row-name" className="text-foreground">
              Department Name
            </Label>
            <Input
              id="row-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Leadership"
              required
              disabled={isBusy}
            />
          </div>
          <div className="flex shrink-0 flex-col gap-2 items-end">
            <LoadingButton type="submit" loading={isBusy}>
              Save
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
