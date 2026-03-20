"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
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
};

export function EditDepartmentFormModal({
  open,
  onOpenChange,
  name,
  onNameChange,
  error,
  onSubmit,
  onCancel,
}: EditDepartmentFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidth="lg">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
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
            <Button type="submit">Save row</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
