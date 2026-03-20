"use client";

import { useState } from "react";
import AdminBoard from "@/components/faculty/AdminBoard";
import { useFacultyBoard } from "@/hooks/useFacultyBoard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Faculty board builder (localStorage-backed). Rendered from /admin → Faculty board tab.
 */
export default function AdminFacultyBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    cards,
    rows,
    isLoaded,
    deleteCard,
    addRow,
    moveRowToBefore,
    updateRowDetail,
    deleteRow,
    addCardToSectionAtIndex,
    upsertCardWithOrdering,
    moveCardWithinSectionToIndex,
    moveCardToSectionAtIndex,
  } = useFacultyBoard();

  if (!isLoaded) {
    return <p className="text-sm text-muted-foreground">Loading faculty board…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="max-w-xl space-y-2">
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
    </div>
  );
}
