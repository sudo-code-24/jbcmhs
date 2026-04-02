"use client";

import { useState } from "react";
import AdminBoard from "@/components/faculty/AdminBoard";
import { useFacultyBoard } from "@/hooks/useFacultyBoard";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmModal } from "@/components/ui/confirm-modal";

/**
 * Faculty board builder (Google Sheet via API). Rendered from /admin → Faculty board tab.
 * Card and department create/update/delete and row Move Up/Down save immediately. Only card
 * drag-and-drop uses **Save card order** to publish.
 */
export default function AdminFacultyBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [saveLayoutDialogOpen, setSaveLayoutDialogOpen] = useState(false);

  const {
    cards,
    rows,
    isLoaded,
    isSaving,
    isLayoutDirty,
    commitLayout,
    revertLayout,
    deleteCard,
    addRow,
    moveRowToBefore,
    updateRowDetail,
    deleteRow,
    addCardToSectionAtIndex,
    upsertCardWithOrdering,
    moveCardWithinSectionToIndex,
    moveCardToSectionAtIndex,
    registerFacultyImageUpload,
  } = useFacultyBoard({ autoPersist: false });

  const handleSaveLayoutCancel = () => {
    revertLayout();
    setSaveLayoutDialogOpen(false);
  };

  const handleSaveLayoutConfirm = () => {
    void (async () => {
      try {
        await commitLayout();
        setSaveLayoutDialogOpen(false);
      } catch (e) {
        console.error(e);
        // pushSavedToServer already surfaced an alert on failure
      }
    })();
  };

  if (!isLoaded) {
    return (
      <p className="text-sm text-muted-foreground">Loading faculty board…</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="max-w-xl flex-1 space-y-2">
          <Label
            htmlFor="admin-faculty-search"
            className="text-muted-foreground"
          >
            Search faculty (builder view)
          </Label>
          <Input
            id="admin-faculty-search"
            type="search"
            placeholder="Name, role, or department…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            aria-describedby="admin-faculty-search-hint"
          />
          <p
            id="admin-faculty-search-hint"
            className="text-xs text-muted-foreground"
          >
            Hides cards that don&apos;t match in each row; full row layout and
            ordering tools stay available.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {isLayoutDirty ? (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              You have changes pending to be save
            </p>
          ) : null}
          <LoadingButton
            variant="default"
            disabled={!isLayoutDirty || isSaving}
            loading={isSaving && isLayoutDirty}
            onClick={() => setSaveLayoutDialogOpen(true)}
            className="min-w-[10rem]"
          >
            Save Changes
          </LoadingButton>
        </div>
      </div>

      <AdminBoard
        onDeleteCard={deleteCard}
        rows={rows}
        cards={cards}
        isSaving={isSaving}
        searchQuery={searchQuery}
        onAddRow={addRow}
        onAddCardToSectionAtIndex={addCardToSectionAtIndex}
        onUpsertCardWithOrdering={upsertCardWithOrdering}
        onMoveCardWithinSectionToIndex={moveCardWithinSectionToIndex}
        onMoveCardToSectionAtIndex={moveCardToSectionAtIndex}
        onMoveRowToBefore={moveRowToBefore}
        onUpdateRowDetail={updateRowDetail}
        onDeleteRow={deleteRow}
        onRegisterFacultyImageUpload={registerFacultyImageUpload}
      />

      <ConfirmModal
        open={saveLayoutDialogOpen}
        onOpenChange={setSaveLayoutDialogOpen}
        title="Save your changes?"
        preventDismiss
        footerClassName="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
        onCancel={handleSaveLayoutCancel}
        onConfirm={handleSaveLayoutConfirm}
        confirmLoading={isSaving}
        description={
          <p className="text-sm text-muted-foreground">
            You moved some cards around. Do you want to keep the new order for
            everyone?
          </p>
        }
      />
    </div>
  );
}
