"use client";

import type { FormEvent } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FacultyCardDraft } from "../types";
import { FACULTY_MODAL_FIELD_GROUP_CLASS } from "../formLayout";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export type FacultyCardFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: string[];
  draft: FacultyCardDraft;
  onDraftChange: (
    next: FacultyCardDraft | ((prev: FacultyCardDraft) => FacultyCardDraft),
  ) => void;
  isEditing: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isBusy?: boolean;
};

export function FacultyCardFormModal({
  open,
  onOpenChange,
  rows,
  draft,
  onDraftChange,
  isEditing,
  onSubmit,
  isBusy = false,
}: FacultyCardFormModalProps) {
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
          <DialogTitle>
            {isEditing ? "Edit Faculty Card" : "Add Faculty Card"}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <fieldset
            disabled={isBusy}
            className="min-w-0 space-y-4 border-0 p-0"
          >
            <div className={FACULTY_MODAL_FIELD_GROUP_CLASS}>
              <Label htmlFor="card-row" className="text-foreground">
                Department
              </Label>
              <select
                id="card-row"
                className={selectClassName}
                value={draft.boardSection}
                onChange={(e) =>
                  onDraftChange((current) => ({
                    ...current,
                    boardSection: e.target.value,
                  }))
                }
              >
                {rows.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className={FACULTY_MODAL_FIELD_GROUP_CLASS}>
              <Label htmlFor="faculty-name" className="text-foreground">
                Name
              </Label>
              <Input
                id="faculty-name"
                value={draft.name}
                onChange={(e) =>
                  onDraftChange((c) => ({ ...c, name: e.target.value }))
                }
                required
              />
            </div>

            <div className={FACULTY_MODAL_FIELD_GROUP_CLASS}>
              <Label htmlFor="faculty-role" className="text-foreground">
                Role
              </Label>
              <Input
                id="faculty-role"
                value={draft.role}
                onChange={(e) =>
                  onDraftChange((c) => ({ ...c, role: e.target.value }))
                }
                required
              />
            </div>

            <div className={FACULTY_MODAL_FIELD_GROUP_CLASS}>
              <Label htmlFor="faculty-photo" className="text-foreground">
                Photo URL (optional)
              </Label>
              <Textarea
                id="faculty-photo"
                rows={3}
                value={draft.photoUrl}
                onChange={(e) =>
                  onDraftChange((c) => ({ ...c, photoUrl: e.target.value }))
                }
              />
            </div>

            <details className="rounded-lg border bg-muted/30 p-3">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                More details
              </summary>
              <div className="mt-3 space-y-4">
                <div className={FACULTY_MODAL_FIELD_GROUP_CLASS}>
                  <Label htmlFor="faculty-email" className="text-foreground">
                    Email (optional)
                  </Label>
                  <Input
                    id="faculty-email"
                    type="email"
                    value={draft.email}
                    onChange={(e) =>
                      onDraftChange((c) => ({ ...c, email: e.target.value }))
                    }
                  />
                </div>
                <div className={FACULTY_MODAL_FIELD_GROUP_CLASS}>
                  <Label htmlFor="faculty-phone" className="text-foreground">
                    Phone (optional)
                  </Label>
                  <Input
                    id="faculty-phone"
                    value={draft.phone}
                    onChange={(e) =>
                      onDraftChange((c) => ({ ...c, phone: e.target.value }))
                    }
                  />
                </div>
              </div>
            </details>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <LoadingButton type="submit" loading={isBusy}>
                {isEditing ? "Save Changes" : "Save"}
              </LoadingButton>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
