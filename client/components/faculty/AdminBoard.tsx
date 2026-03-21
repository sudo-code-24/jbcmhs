"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { matchesFacultySearch } from "@/lib/facultyBoardSearch";
import { cn } from "@/lib/utils";
import FacultyCard from "./FacultyCard";
import {
  emptyFacultyCardDraft,
  type FacultyCardDraft,
} from "./admin-board/types";
import { CreateDepartmentFormModal } from "./admin-board/modals/CreateDepartmentFormModal";
import { EditDepartmentFormModal } from "./admin-board/modals/EditDepartmentFormModal";
import { FacultyCardFormModal } from "./admin-board/modals/FacultyCardFormModal";

type AdminBoardProps = {
  rows: string[];
  cards: FacultyCardItem[];
  onAddRow: (rowName: string) => void;
  onAddCardToSectionAtIndex: (
    card: Omit<FacultyCardItem, "id">,
    targetSection: string,
    targetIndex1Based: number,
  ) => void;
  onUpsertCardWithOrdering: (card: FacultyCardItem) => void;
  onDeleteCard: (id: string) => void;
  onMoveCardWithinSectionToIndex: (id: string, targetIndex: number) => void;
  onMoveCardToSectionAtIndex: (
    id: string,
    targetSection: string,
    targetIndex: number,
  ) => void;
  onMoveRowToBefore: (fromIndex: number, beforeIndex: number) => void;
  onUpdateRowDetail: (fromSection: string, toSection: string) => void;
  onDeleteRow: (section: string) => void;
  searchQuery?: string;
  /** True while faculty board data is saving to the server */
  isSaving?: boolean;
};

export default function AdminBoard({
  rows,
  cards,
  onAddRow,
  onAddCardToSectionAtIndex,
  onUpsertCardWithOrdering,
  onDeleteCard,
  onMoveCardWithinSectionToIndex,
  onMoveCardToSectionAtIndex,
  onMoveRowToBefore,
  onUpdateRowDetail,
  onDeleteRow,
  searchQuery = "",
  isSaving = false,
}: AdminBoardProps) {
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [rowModalOpen, setRowModalOpen] = useState(false);
  const [editRowModalOpen, setEditRowModalOpen] = useState(false);
  const [editRowOriginalSection, setEditRowOriginalSection] = useState<
    string | null
  >(null);
  const [editRowNameDraft, setEditRowNameDraft] = useState("");
  const [editRowError, setEditRowError] = useState<string | null>(null);
  const [deleteRowTarget, setDeleteRowTarget] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FacultyCardDraft>(emptyFacultyCardDraft);
  const [rowDraft, setRowDraft] = useState("");

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overRow, setOverRow] = useState<string | null>(null);

  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [cardSaveConfirmOpen, setCardSaveConfirmOpen] = useState(false);
  const pendingCardSaveRef = useRef<{
    editingId: string | null;
    payload: Omit<FacultyCardItem, "id">;
  } | null>(null);
  const [editRowSaveConfirmOpen, setEditRowSaveConfirmOpen] = useState(false);

  const cardsForRow = useMemo(() => {
    const bySection = new Map<string, FacultyCardItem[]>();
    cards.forEach((card) => {
      const section = card.boardSection;
      const list = bySection.get(section) ?? ([] as FacultyCardItem[]);
      list.push(card);
      bySection.set(section, list);
    });
    bySection.forEach((list) => {
      list.sort((a, b) => a.positionIndex - b.positionIndex);
    });
    return bySection;
  }, [cards]);

  const searchTrim = searchQuery.trim();
  const adminHasVisibleCards = useMemo(() => {
    if (!searchTrim) return true;
    return rows.some((rowSection) => {
      const list = cardsForRow.get(rowSection) ?? [];
      return list.some((c) => matchesFacultySearch(c, searchQuery));
    });
  }, [rows, cardsForRow, searchQuery, searchTrim]);

  const openCreateCardForRow = (rowSection: string) => {
    const rowCards = cardsForRow.get(rowSection) ?? [];
    setEditingId(null);
    setDraft({
      ...emptyFacultyCardDraft,
      boardSection: rowSection,
      positionIndex: rowCards.length + 1,
    });
    setCardModalOpen(true);
  };

  const openEditCard = (card: FacultyCardItem) => {
    setEditingId(card.id);
    setDraft({
      name: card.name,
      role: card.role,
      boardSection: card.boardSection,
      positionIndex: card.positionIndex,
      email: card.email ?? "",
      phone: card.phone ?? "",
      photoUrl: card.photoUrl ?? "",
    });
    setCardModalOpen(true);
  };

  const normalizeDraftToFacultyCard = (): Omit<FacultyCardItem, "id"> => ({
    name: draft.name.trim(),
    role: draft.role.trim(),
    department: draft.boardSection.trim(),
    boardSection: draft.boardSection.trim(),
    email: draft.email.trim() ? draft.email.trim() : undefined,
    phone: draft.phone.trim() ? draft.phone.trim() : undefined,
    photoUrl: draft.photoUrl.trim() ? draft.photoUrl.trim() : undefined,
    positionIndex: Math.max(1, Math.floor(Number(draft.positionIndex) || 1)),
  });

  const onSubmitCard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.role.trim() || !draft.boardSection.trim()) {
      return;
    }

    pendingCardSaveRef.current = {
      editingId,
      payload: normalizeDraftToFacultyCard(),
    };
    setCardSaveConfirmOpen(true);
  };

  const confirmCardSave = () => {
    const pending = pendingCardSaveRef.current;
    if (!pending) return;
    const { editingId: id, payload } = pending;
    if (id) {
      onUpsertCardWithOrdering({ id, ...payload });
    } else {
      onAddCardToSectionAtIndex(
        payload,
        payload.boardSection,
        payload.positionIndex,
      );
    }
    pendingCardSaveRef.current = null;
    setCardSaveConfirmOpen(false);
    setCardModalOpen(false);
  };

  const cancelCardSave = () => {
    pendingCardSaveRef.current = null;
    setCardSaveConfirmOpen(false);
  };

  const openEditRow = (section: string) => {
    setEditRowOriginalSection(section);
    setEditRowNameDraft(section);
    setEditRowError(null);
    setEditRowModalOpen(true);
  };

  const closeEditRowModal = () => {
    setEditRowModalOpen(false);
    setEditRowOriginalSection(null);
    setEditRowError(null);
  };

  const onEditRowFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editRowOriginalSection) return;
    const next = editRowNameDraft.trim();
    if (!next) {
      setEditRowError("Row name is required.");
      return;
    }
    if (next !== editRowOriginalSection && rows.includes(next)) {
      setEditRowError("A row with that name already exists.");
      return;
    }
    setEditRowSaveConfirmOpen(true);
  };

  const confirmSaveDepartment = () => {
    if (!editRowOriginalSection) return;
    onUpdateRowDetail(editRowOriginalSection, editRowNameDraft.trim());
    setEditRowSaveConfirmOpen(false);
    closeEditRowModal();
  };

  const cardsInDeleteTarget =
    deleteRowTarget != null
      ? cards.filter((c) => c.boardSection === deleteRowTarget).length
      : 0;

  const deleteCardTarget = deleteCardId
    ? cards.find((c) => c.id === deleteCardId)
    : null;

  const onCreateDepartmentSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rowDraft.trim()) return;
    onAddRow(rowDraft);
    setRowModalOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-primary">
          Faculty Board Builder
        </h2>
        <div className="flex gap-2">
          <LoadingButton
            variant="secondary"
            loading={isSaving}
            onClick={() => {
              setRowDraft("");
              setRowModalOpen(true);
            }}
          >
            Create New Department
          </LoadingButton>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          No rows yet. Create a row, then add columns (cards).
        </div>
      ) : null}

      {rows.length > 0 && searchTrim && !adminHasVisibleCards ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No faculty match your search in any row. Clear the search box to see
          all cards.
        </div>
      ) : null}

      {rows.map((rowSection, rowIdx) => {
        const rowCards = cardsForRow.get(rowSection) ?? [];
        const displayRowCards = searchTrim
          ? rowCards.filter((c) => matchesFacultySearch(c, searchQuery))
          : rowCards;

        if (searchTrim && displayRowCards.length === 0) {
          return null;
        }

        return (
          <section
            key={rowSection}
            className={cn(
              "space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm transition",
              "dark:border-white/10 dark:bg-slate-900/45 dark:shadow-md dark:shadow-black/20",
              overRow === rowSection && draggingId && "ring-2 ring-primary/60",
            )}
            onDragOver={(e) => {
              if (isSaving || !draggingId) return;
              e.preventDefault();
              setOverRow(rowSection);
            }}
            onDragLeave={(e) => {
              if (isSaving || !draggingId) return;
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setOverRow((prev) => (prev === rowSection ? null : prev));
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isSaving) return;
              const raw =
                e.dataTransfer.getData("text/plain") || draggingId || "";
              const sourceId = raw || draggingId;
              if (!sourceId) return;

              onMoveCardToSectionAtIndex(sourceId, rowSection, rowCards.length);
              setDraggingId(null);
              setOverId(null);
              setOverRow(null);
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold">{rowSection}</h3>
                <p className="text-xs text-muted-foreground">
                  Reorder rows with Move Up ↑ / Move Down ↓. Drag cards to
                  reorder within a row or move to another row (drop on a card or
                  this panel).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSaving || rowIdx <= 0}
                  onClick={() => onMoveRowToBefore(rowIdx, rowIdx - 1)}
                >
                  Move Up ↑
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSaving || rowIdx >= rows.length - 1}
                  onClick={() => onMoveRowToBefore(rowIdx, rowIdx + 2)}
                >
                  Move Down ↓
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => openEditRow(rowSection)}
                >
                  Edit Department
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={isSaving}
                  onClick={() => setDeleteRowTarget(rowSection)}
                >
                  Delete Department
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isSaving}
                  onClick={() => openCreateCardForRow(rowSection)}
                >
                  Add New Staff
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {displayRowCards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-xl ${overId === card.id ? "ring-2 ring-primary/60" : ""}`}
                  draggable={!isSaving}
                  onDragStart={(e) => {
                    if (isSaving) return;
                    e.dataTransfer.setData("text/plain", card.id);
                    e.dataTransfer.effectAllowed = "move";
                    setDraggingId(card.id);
                    setOverId(card.id);
                    setOverRow(rowSection);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setOverId(null);
                    setOverRow(null);
                  }}
                  onDragOver={(e) => {
                    if (isSaving || !draggingId) return;
                    e.preventDefault();
                    setOverId(card.id);
                    setOverRow(rowSection);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isSaving) return;
                    const raw =
                      e.dataTransfer.getData("text/plain") || draggingId || "";
                    const sourceId = raw || draggingId;
                    if (!sourceId || sourceId === card.id) return;

                    const sourceCard = cards.find((c) => c.id === sourceId);
                    if (!sourceCard) return;

                    const targetIndexInRow = rowCards.findIndex(
                      (c) => c.id === card.id,
                    );
                    const dropIndex =
                      targetIndexInRow >= 0 ? targetIndexInRow : 0;
                    if (sourceCard.boardSection === rowSection) {
                      onMoveCardWithinSectionToIndex(sourceId, dropIndex);
                    } else {
                      onMoveCardToSectionAtIndex(
                        sourceId,
                        rowSection,
                        dropIndex,
                      );
                    }

                    setDraggingId(null);
                    setOverId(null);
                    setOverRow(null);
                  }}
                >
                  <div className={draggingId === card.id ? "opacity-50" : ""}>
                    <FacultyCard card={card} compact />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 px-1 pb-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={isSaving}
                      onClick={() => openEditCard(card)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={isSaving}
                      onClick={() => setDeleteCardId(card.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <EditDepartmentFormModal
        open={editRowModalOpen}
        onOpenChange={(next) => {
          if (!next) closeEditRowModal();
        }}
        name={editRowNameDraft}
        onNameChange={(value) => {
          setEditRowNameDraft(value);
          setEditRowError(null);
        }}
        error={editRowError}
        onSubmit={onEditRowFormSubmit}
        onCancel={closeEditRowModal}
        isBusy={isSaving}
      />

      <ConfirmModal
        open={deleteRowTarget != null}
        onOpenChange={(next) => !next && setDeleteRowTarget(null)}
        title="Delete row?"
        maxWidth="lg"
        actionsOrder="confirm-first"
        footerClassName="flex-wrap gap-2"
        confirmVariant="destructive"
        confirmLoading={isSaving}
        onConfirm={() => {
          if (deleteRowTarget) onDeleteRow(deleteRowTarget);
          setDeleteRowTarget(null);
        }}
        description={
          <p className="text-sm text-muted-foreground">
            This will remove the row{" "}
            <span className="font-medium text-foreground">
              &quot;{deleteRowTarget}&quot;
            </span>{" "}
            from the board and permanently delete{" "}
            <span className="font-medium text-foreground">{cardsInDeleteTarget}</span>{" "}
            {cardsInDeleteTarget === 1 ? "card" : "cards"} in that row. This cannot be undone.
          </p>
        }
      />

      <CreateDepartmentFormModal
        open={rowModalOpen}
        onOpenChange={setRowModalOpen}
        name={rowDraft}
        onNameChange={setRowDraft}
        onSubmit={onCreateDepartmentSubmit}
        isBusy={isSaving}
      />

      <FacultyCardFormModal
        open={cardModalOpen}
        onOpenChange={setCardModalOpen}
        rows={rows}
        draft={draft}
        onDraftChange={setDraft}
        isEditing={editingId != null}
        onSubmit={onSubmitCard}
        isBusy={isSaving}
      />

      <ConfirmModal
        open={deleteCardId != null}
        onOpenChange={(open) => !open && setDeleteCardId(null)}
        title="Delete faculty card?"
        confirmVariant="destructive"
        confirmLoading={isSaving}
        onConfirm={() => {
          if (deleteCardId) onDeleteCard(deleteCardId);
          setDeleteCardId(null);
        }}
        description={
          <p className="text-sm text-muted-foreground">
            Remove{" "}
            <span className="font-medium text-foreground">
              {deleteCardTarget?.name ?? "this card"}
            </span>{" "}
            from the board. This takes effect immediately on the live faculty board.
          </p>
        }
      />

      <ConfirmModal
        open={cardSaveConfirmOpen}
        onOpenChange={(open) => {
          if (!open) cancelCardSave();
        }}
        title={editingId ? "Save changes to this card?" : "Add this faculty card?"}
        description={
          editingId
            ? "Changes are saved to the live faculty board as soon as you confirm."
            : "The new card is added to the live faculty board as soon as you confirm."
        }
        confirmLoading={isSaving}
        onConfirm={confirmCardSave}
      />

      <ConfirmModal
        open={editRowSaveConfirmOpen}
        onOpenChange={(open) => !open && setEditRowSaveConfirmOpen(false)}
        title="Save Department changes?"
        description={
          <p className="text-sm text-muted-foreground">
            Rename this department and update every card in it. This is saved to the live faculty board as
            soon as you confirm.
          </p>
        }
        confirmLoading={isSaving}
        onConfirm={confirmSaveDepartment}
      />
    </div>
  );
}
