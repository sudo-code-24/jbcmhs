"use client";

import { FormEvent, useMemo, useState } from "react";
import type { FacultyCardItem } from "@/hooks/useFacultyBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { matchesFacultySearch } from "@/lib/facultyBoardSearch";
import { cn } from "@/lib/utils";
import FacultyCard from "./FacultyCard";

type DraftCard = {
  name: string;
  role: string;
  department: string;
  boardSection: string;
  positionIndex: number; // 1-based column
  email: string;
  phone: string;
  photoUrl: string;
};

type AdminBoardProps = {
  rows: string[];
  cards: FacultyCardItem[];
  onAddRow: (rowName: string) => void;
  onAddCardToSectionAtIndex: (card: Omit<FacultyCardItem, "id">, targetSection: string, targetIndex1Based: number) => void;
  onUpsertCardWithOrdering: (card: FacultyCardItem) => void;
  onDeleteCard: (id: string) => void;
  onMoveCardWithinSectionToIndex: (id: string, targetIndex: number) => void;
  onMoveCardToSectionAtIndex: (id: string, targetSection: string, targetIndex: number) => void;
  onMoveRowToBefore: (fromIndex: number, beforeIndex: number) => void;
  onUpdateRowDetail: (fromSection: string, toSection: string) => void;
  onDeleteRow: (section: string) => void;
  /** When set, only matching cards are shown per row (full data is unchanged). */
  searchQuery?: string;
};

const emptyDraft: DraftCard = {
  name: "",
  role: "",
  department: "",
  boardSection: "",
  positionIndex: 1,
  email: "",
  phone: "",
  photoUrl: "",
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
}: AdminBoardProps) {
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [rowModalOpen, setRowModalOpen] = useState(false);
  const [editRowModalOpen, setEditRowModalOpen] = useState(false);
  const [editRowOriginalSection, setEditRowOriginalSection] = useState<string | null>(null);
  const [editRowNameDraft, setEditRowNameDraft] = useState("");
  const [editRowError, setEditRowError] = useState<string | null>(null);
  const [deleteRowTarget, setDeleteRowTarget] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftCard>(emptyDraft);
  const [rowDraft, setRowDraft] = useState("");

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overRow, setOverRow] = useState<string | null>(null);

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
      name: "",
      role: "",
      department: "",
      boardSection: rowSection,
      positionIndex: rowCards.length + 1,
      email: "",
      phone: "",
      photoUrl: "",
    });
    setCardModalOpen(true);
  };

  const openEditCard = (card: FacultyCardItem) => {
    setEditingId(card.id);
    setDraft({
      name: card.name,
      role: card.role,
      department: card.department,
      boardSection: card.boardSection,
      positionIndex: card.positionIndex,
      email: card.email ?? "",
      phone: card.phone ?? "",
      photoUrl: card.photoUrl ?? "",
    });
    setCardModalOpen(true);
  };

  const normalizeDraftToFacultyCard = (): Omit<FacultyCardItem, "id"> => {
    return {
      name: draft.name.trim(),
      role: draft.role.trim(),
      department: draft.department.trim(),
      boardSection: draft.boardSection.trim(),
      email: draft.email.trim() ? draft.email.trim() : undefined,
      phone: draft.phone.trim() ? draft.phone.trim() : undefined,
      photoUrl: draft.photoUrl.trim() ? draft.photoUrl.trim() : undefined,
      positionIndex: Math.max(1, Math.floor(Number(draft.positionIndex) || 1)),
    };
  };

  const onSubmitCard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.role.trim() || !draft.department.trim() || !draft.boardSection.trim()) return;

    const normalized = normalizeDraftToFacultyCard();
    if (editingId) {
      onUpsertCardWithOrdering({ id: editingId, ...normalized });
    } else {
      onAddCardToSectionAtIndex(normalized, normalized.boardSection, normalized.positionIndex);
    }
    setCardModalOpen(false);
  };

  const openEditRow = (section: string) => {
    setEditRowOriginalSection(section);
    setEditRowNameDraft(section);
    setEditRowError(null);
    setEditRowModalOpen(true);
  };

  const cardsInDeleteTarget =
    deleteRowTarget != null ? cards.filter((c) => c.boardSection === deleteRowTarget).length : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-primary">Faculty Board Builder</h2>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => { setRowDraft(""); setRowModalOpen(true); }}>
            Create New Row
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          No rows yet. Create a row, then add columns (cards).
        </div>
      ) : null}

      {rows.length > 0 && searchTrim && !adminHasVisibleCards ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No faculty match your search in any row. Clear the search box to see all cards.
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
                overRow === rowSection && draggingId && "ring-2 ring-primary/60"
              )}
              onDragOver={(e) => {
                if (!draggingId) return;
                e.preventDefault();
                setOverRow(rowSection);
              }}
              onDragLeave={(e) => {
                if (!draggingId) return;
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOverRow((prev) => (prev === rowSection ? null : prev));
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const raw = e.dataTransfer.getData("text/plain") || draggingId || "";
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
                  <h3 className="text-lg font-semibold">
                    {rowSection}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Reorder rows with Row ↑ / Row ↓. Drag cards to reorder within a row or move to another row (drop on a card
                    or this panel).
                  </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={rowIdx <= 0}
                  onClick={() => onMoveRowToBefore(rowIdx, rowIdx - 1)}
                >
                  Row ↑
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={rowIdx >= rows.length - 1}
                  onClick={() => onMoveRowToBefore(rowIdx, rowIdx + 2)}
                >
                  Row ↓
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => openEditRow(rowSection)}>
                  Edit row
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => setDeleteRowTarget(rowSection)}>
                  Delete row
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => openCreateCardForRow(rowSection)}>
                  Add Column
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {displayRowCards.map((card) => (
                <div
                  key={card.id}
                  className={`rounded-xl ${overId === card.id ? "ring-2 ring-primary/60" : ""}`}
                  draggable
                  onDragStart={(e) => {
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
                    if (!draggingId) return;
                    e.preventDefault();
                    setOverId(card.id);
                    setOverRow(rowSection);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const raw = e.dataTransfer.getData("text/plain") || draggingId || "";
                    const sourceId = raw || draggingId;
                    if (!sourceId || sourceId === card.id) return;

                    const sourceCard = cards.find((c) => c.id === sourceId);
                    if (!sourceCard) return;

                    const targetIndexInRow = rowCards.findIndex((c) => c.id === card.id);
                    const dropIndex = targetIndexInRow >= 0 ? targetIndexInRow : 0;
                    if (sourceCard.boardSection === rowSection) {
                      onMoveCardWithinSectionToIndex(sourceId, dropIndex);
                    } else {
                      onMoveCardToSectionAtIndex(sourceId, rowSection, dropIndex);
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
                    <Button type="button" size="sm" variant="secondary" onClick={() => openEditCard(card)}>
                      Edit
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={() => onDeleteCard(card.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <Dialog
        open={editRowModalOpen}
        onOpenChange={(next) => {
          if (!next) {
            setEditRowModalOpen(false);
            setEditRowOriginalSection(null);
            setEditRowError(null);
          }
        }}
      >
        <DialogContent maxWidth="lg">
          <DialogHeader>
            <DialogTitle>Edit row</DialogTitle>
          </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
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
            onUpdateRowDetail(editRowOriginalSection, next);
            setEditRowModalOpen(false);
            setEditRowOriginalSection(null);
            setEditRowError(null);
          }}
        >
          <div>
            <Label htmlFor="edit-row-name">Row name</Label>
            <Input
              id="edit-row-name"
              value={editRowNameDraft}
              onChange={(e) => {
                setEditRowNameDraft(e.target.value);
                setEditRowError(null);
              }}
              required
            />
          </div>
          {editRowError ? <p className="text-sm text-destructive">{editRowError}</p> : null}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit">Save row</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditRowModalOpen(false);
                setEditRowOriginalSection(null);
                setEditRowError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteRowTarget != null} onOpenChange={(next) => !next && setDeleteRowTarget(null)}>
        <DialogContent maxWidth="lg">
          <DialogHeader>
            <DialogTitle>Delete row?</DialogTitle>
          </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will remove the row <span className="font-medium text-foreground">&quot;{deleteRowTarget}&quot;</span> from the
            board and permanently delete <span className="font-medium text-foreground">{cardsInDeleteTarget}</span>{" "}
            {cardsInDeleteTarget === 1 ? "card" : "cards"} in that row. This cannot be undone.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (deleteRowTarget) onDeleteRow(deleteRowTarget);
                setDeleteRowTarget(null);
              }}
            >
              Delete row and cards
            </Button>
            <Button type="button" variant="outline" onClick={() => setDeleteRowTarget(null)}>
              Cancel
            </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rowModalOpen} onOpenChange={(next) => !next && setRowModalOpen(false)}>
        <DialogContent maxWidth="lg">
          <DialogHeader>
            <DialogTitle>Create New Row</DialogTitle>
          </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rowDraft.trim()) return;
            onAddRow(rowDraft);
            setRowModalOpen(false);
          }}
        >
          <div>
            <Label htmlFor="row-name">Row Name</Label>
            <Input id="row-name" value={rowDraft} onChange={(e) => setRowDraft(e.target.value)} placeholder="e.g. Leadership" required />
          </div>
          <div className="pt-2">
            <Button type="submit">Create Row</Button>
          </div>
        </form>
        </DialogContent>
      </Dialog>

      <Dialog open={cardModalOpen} onOpenChange={(next) => !next && setCardModalOpen(false)}>
        <DialogContent maxWidth="lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Faculty Card" : "Add Faculty Card"}</DialogTitle>
          </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmitCard}>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="card-row">Row</Label>
              <select
                id="card-row"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={draft.boardSection}
                onChange={(e) => setDraft((current) => ({ ...current, boardSection: e.target.value }))}
              >
                {rows.map((r, i) => (
                  <option key={r} value={r}>
                  {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="card-column">Column</Label>
              <Input
                id="card-column"
                type="number"
                min={1}
                value={draft.positionIndex}
                onChange={(e) => setDraft((current) => ({ ...current, positionIndex: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="faculty-name">Name</Label>
            <Input id="faculty-name" value={draft.name} onChange={(e) => setDraft((c) => ({ ...c, name: e.target.value }))} required />
          </div>

          <div>
            <Label htmlFor="faculty-role">Role</Label>
            <Input id="faculty-role" value={draft.role} onChange={(e) => setDraft((c) => ({ ...c, role: e.target.value }))} required />
          </div>

          <div>
            <Label htmlFor="faculty-dept">Department</Label>
            <Input
              id="faculty-dept"
              value={draft.department}
              onChange={(e) => setDraft((c) => ({ ...c, department: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="faculty-photo">Photo URL (optional)</Label>
            <Textarea
              id="faculty-photo"
              rows={3}
              value={draft.photoUrl}
              onChange={(e) => setDraft((c) => ({ ...c, photoUrl: e.target.value }))}
            />
          </div>

          <details className="rounded-lg border bg-muted/30 p-3">
            <summary className="cursor-pointer text-sm text-muted-foreground">More details</summary>
            <div className="mt-3 space-y-3">
              <div>
                <Label htmlFor="faculty-email">Email (optional)</Label>
                <Input
                  id="faculty-email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft((c) => ({ ...c, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="faculty-phone">Phone (optional)</Label>
                <Input
                  id="faculty-phone"
                  value={draft.phone}
                  onChange={(e) => setDraft((c) => ({ ...c, phone: e.target.value }))}
                />
              </div>
            </div>
          </details>

          <div className="pt-2">
            <Button type="submit">{editingId ? "Save Changes" : "Create Card"}</Button>
          </div>
        </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
