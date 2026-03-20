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

export type CreateDepartmentFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CreateDepartmentFormModal({
  open,
  onOpenChange,
  name,
  onNameChange,
  onSubmit,
}: CreateDepartmentFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            />
          </div>
          <div className="flex shrink-0 flex-col gap-2 items-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
