"use client";

import { useState } from "react";
import AdminBoard from "@/components/faculty/AdminBoard";
import { useFacultyBoard } from "@/hooks/useFacultyBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmModal } from "@/components/ui/confirm-modal";

/**
 * Faculty board builder (localStorage-backed). Rendered from /admin → Faculty board tab.
 * Uses draft mode: changes apply in memory until **Save layout** confirms persist.
 */
export default function AdminFacultyBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [saveLayoutDialogOpen, setSaveLayoutDialogOpen] = useState(false);

  const {
    cards,
    rows,
    isLoaded,
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
  } = useFacultyBoard({ autoPersist: false });

  const handleSaveLayoutCancel = () => {
    revertLayout();
    setSaveLayoutDialogOpen(false);
  };

  const handleSaveLayoutConfirm = () => {
    commitLayout();
    setSaveLayoutDialogOpen(false);
  };

  if (!isLoaded) {
    return <p className="text-sm text-muted-foreground">Loading faculty board…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="max-w-xl flex-1 space-y-2">
          <Label htmlFor="admin-faculty-search" className="text-muted-foreground">
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
          <p id="admin-faculty-search-hint" className="text-xs text-muted-foreground">
            Hides cards that don&apos;t match in each row; full row layout and ordering tools stay available.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {isLayoutDirty ? (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Unsaved layout changes</p>
          ) : (
            <p className="text-xs text-muted-foreground">Layout matches last saved</p>
          )}
          <Button
            type="button"
            variant="default"
            disabled={!isLayoutDirty}
            onClick={() => setSaveLayoutDialogOpen(true)}
          >
            Save layout
          </Button>
        </div>
      </div>

      <AdminBoard
        onDeleteCard={deleteCard}
        rows={rows}
        cards={cards}
        searchQuery={searchQuery}
        onAddRow={addRow}
        onAddCardToSectionAtIndex={addCardToSectionAtIndex}
        onUpsertCardWithOrdering={upsertCardWithOrdering}
        onMoveCardWithinSectionToIndex={moveCardWithinSectionToIndex}
        onMoveCardToSectionAtIndex={moveCardToSectionAtIndex}
        onMoveRowToBefore={moveRowToBefore}
        onUpdateRowDetail={updateRowDetail}
        onDeleteRow={deleteRow}
      />

      <ConfirmModal
        open={saveLayoutDialogOpen}
        onOpenChange={setSaveLayoutDialogOpen}
        title="Save layout?"
        preventDismiss
        showClose={false}
        footerClassName="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
        cancelLabel="Cancel & revert"
        confirmLabel="OK — Save layout"
        onCancel={handleSaveLayoutCancel}
        onConfirm={handleSaveLayoutConfirm}
        description={
          <p className="text-sm text-muted-foreground">
            This publishes your faculty board changes for visitors on the public Faculty Board page. If
            you choose <span className="font-medium text-foreground">Cancel</span>, all edits since the last
            save will be reverted.
          </p>
        }
      />
    </div>
  );
}
