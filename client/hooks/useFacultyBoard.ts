"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from "react";
import initialFacultyCards from "@/data/facultyBoard.initial.json";
import type { FacultyCardItem } from "@/lib/types";
import { getFacultyBoard, saveFacultyBoard } from "@/lib/api";

export type { FacultyCardItem };

/** Dispatched after admin saves; public board refetches from API. */
export const FACULTY_BOARD_STORAGE_EVENT = "faculty-board-storage-updated";

type FacultyBoardState = {
  rows: string[];
  cards: FacultyCardItem[];
};

export type UseFacultyBoardOptions = {
  /**
   * When `true` (default), public board refetches periodically and on sync events.
 * When `false` (admin builder), card/department CRUD and row order (Move Up/Down) persist immediately;
 * only card drag-and-drop reordering stays local until `commitLayout()` saves to the server.
   */
  autoPersist?: boolean;
};

const normalizeCards = (cards: FacultyCardItem[]): FacultyCardItem[] =>
  cards.map((card, index) => ({
    ...card,
    positionIndex: Number.isFinite(card.positionIndex) ? card.positionIndex : index + 1,
  }));

const deriveRowsFromCards = (cards: FacultyCardItem[]) => {
  const seen = new Set<string>();
  const ordered: string[] = [];
  cards.forEach((card) => {
    const section = (card.boardSection ?? "").trim();
    if (!section) return;
    if (seen.has(section)) return;
    seen.add(section);
    ordered.push(section);
  });
  return ordered;
};

function cloneBoard(state: FacultyBoardState): FacultyBoardState {
  return {
    rows: [...state.rows],
    cards: state.cards.map((c) => ({ ...c })),
  };
}

function boardEquals(a: FacultyBoardState, b: FacultyBoardState): boolean {
  return (
    JSON.stringify({ rows: a.rows, cards: a.cards }) === JSON.stringify({ rows: b.rows, cards: b.cards })
  );
}

function seedBoardFromJson(): FacultyBoardState {
  const normalizedCards = normalizeCards(initialFacultyCards as FacultyCardItem[]);
  return {
    cards: normalizedCards,
    rows: deriveRowsFromCards(normalizedCards),
  };
}

export function useFacultyBoard(options: UseFacultyBoardOptions = {}) {
  const { autoPersist = true } = options;

  const [board, setBoard] = useState<FacultyBoardState>({ rows: [], cards: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  /** Bumps when `commitLayout` runs so `isLayoutDirty` recomputes */
  const [savedVersion, setSavedVersion] = useState(0);
  const savedBoardRef = useRef<FacultyBoardState | null>(null);

  const { rows, cards } = board;

  const setCards = useCallback((updater: SetStateAction<FacultyCardItem[]>) => {
    setBoard((prev) => ({
      ...prev,
      cards: typeof updater === "function" ? updater(prev.cards) : updater,
    }));
  }, []);

  const setRows = useCallback((updater: SetStateAction<string[]>) => {
    setBoard((prev) => ({
      ...prev,
      rows: typeof updater === "function" ? updater(prev.rows) : updater,
    }));
  }, []);

  const loadFromApi = useCallback(async (options?: { isInitial?: boolean }) => {
    try {
      const data = await getFacultyBoard();
      if (data.sheetEmpty) {
        setBoard(seedBoardFromJson());
      } else {
        setBoard({
          rows: data.rows,
          cards: normalizeCards(data.cards),
        });
      }
    } catch {
      setBoard(seedBoardFromJson());
    } finally {
      if (options?.isInitial) setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadFromApi({ isInitial: true });
  }, [loadFromApi]);

  /** Draft mode: snapshot last-saved board once after hydration */
  useEffect(() => {
    if (!isLoaded || autoPersist) return;
    if (savedBoardRef.current !== null) return;
    savedBoardRef.current = cloneBoard({ rows, cards });
    setSavedVersion((v) => v + 1);
  }, [isLoaded, autoPersist, rows, cards]);

  /** Public board: refetch when admin saves (same tab) or another tab broadcasts */
  useEffect(() => {
    if (!autoPersist) return;
    const sync = () => {
      void loadFromApi();
    };
    window.addEventListener(FACULTY_BOARD_STORAGE_EVENT, sync);
    let bc: BroadcastChannel | undefined;
    try {
      bc = new BroadcastChannel("faculty-board");
      bc.onmessage = sync;
    } catch {
      /* ignore */
    }
    const interval = window.setInterval(sync, 90_000);
    return () => {
      window.removeEventListener(FACULTY_BOARD_STORAGE_EVENT, sync);
      bc?.close();
      window.clearInterval(interval);
    };
  }, [autoPersist, loadFromApi]);

  const pushSavedToServer = useCallback(async (state: FacultyBoardState): Promise<boolean> => {
    try {
      await saveFacultyBoard(state);
      savedBoardRef.current = cloneBoard(state);
      setSavedVersion((v) => v + 1);
      window.dispatchEvent(new CustomEvent(FACULTY_BOARD_STORAGE_EVENT));
      try {
        const channel = new BroadcastChannel("faculty-board");
        channel.postMessage("sync");
        channel.close();
      } catch {
        /* ignore */
      }
      return true;
    } catch (e) {
      console.error(e);
      window.alert(
        e instanceof Error ? e.message : "Could not save the faculty board. Please try again."
      );
      return false;
    }
  }, []);

  /** Admin: persist after CRUD; skipped when public `autoPersist` (no admin mutations). */
  const schedulePersist = useCallback(
    (next: FacultyBoardState) => {
      if (autoPersist) return;
      queueMicrotask(() => {
        void pushSavedToServer(next);
      });
    },
    [autoPersist, pushSavedToServer]
  );

  const commitLayout = useCallback(async () => {
    const ok = await pushSavedToServer(cloneBoard({ rows, cards }));
    if (!ok) throw new Error("Save failed");
  }, [rows, cards, pushSavedToServer]);

  const revertLayout = useCallback(() => {
    const snap = savedBoardRef.current;
    if (!snap) return;
    setBoard(cloneBoard(snap));
  }, []);

  const isLayoutDirty = useMemo(() => {
    if (autoPersist) return false;
    const snap = savedBoardRef.current;
    if (!snap) return false;
    return !boardEquals({ rows, cards }, snap);
  }, [autoPersist, rows, cards, savedVersion]);

  const groupedCards = useMemo(() => {
    const rowOrder = rows.length > 0 ? rows : deriveRowsFromCards(cards);
    const rowSet = new Set(rowOrder);

    const missingSections = deriveRowsFromCards(cards).filter((s) => !rowSet.has(s));
    const orderedSections = [...rowOrder, ...missingSections];

    return orderedSections
      .map((section) => {
        const sectionCards = cards
          .filter((card) => card.boardSection === section)
          .sort((a, b) => a.positionIndex - b.positionIndex);
        if (sectionCards.length === 0) return null;
        return { section, cards: sectionCards };
      })
      .filter((v): v is { section: string; cards: FacultyCardItem[] } => v !== null);
  }, [cards, rows]);

  const saveCard = useCallback((nextCard: FacultyCardItem) => {
    setCards((current) => {
      const index = current.findIndex((card) => card.id === nextCard.id);
      if (index === -1) {
        return [...current, nextCard];
      }
      const next = [...current];
      next[index] = nextCard;
      return next;
    });
  }, [setCards]);

  const addCard = useCallback(
    (card: Omit<FacultyCardItem, "id">) => {
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `f-${Date.now()}`;
      saveCard({ ...card, id });
    },
    [saveCard]
  );

  const deleteCard = useCallback(
    (id: string) => {
      setBoard((prev) => {
        const next: FacultyBoardState = {
          rows: [...prev.rows],
          cards: prev.cards.filter((card) => card.id !== id),
        };
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  const moveCardWithinSection = useCallback(
    (id: string, direction: "up" | "down") => {
      setCards((current) => {
        const card = current.find((item) => item.id === id);
        if (!card) return current;

        const sectionCards = current
          .filter((item) => item.boardSection === card.boardSection)
          .sort((a, b) => a.positionIndex - b.positionIndex);

        const index = sectionCards.findIndex((item) => item.id === id);
        if (index < 0) return current;

        const swapIndex = direction === "up" ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= sectionCards.length) return current;

        const reordered = [...sectionCards];
        [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
        const byId = new Map(reordered.map((item, idx) => [item.id, idx + 1]));

        return current.map((item) =>
          item.boardSection === card.boardSection
            ? { ...item, positionIndex: byId.get(item.id) ?? item.positionIndex }
            : item
        );
      });
    },
    [setCards]
  );

  const moveCardWithinSectionToIndex = useCallback(
    (id: string, targetIndex: number) => {
      setCards((current) => {
        const card = current.find((item) => item.id === id);
        if (!card) return current;

        const section = card.boardSection;
        const sectionCards = current
          .filter((item) => item.boardSection === section)
          .sort((a, b) => a.positionIndex - b.positionIndex);

        const currentIndex = sectionCards.findIndex((item) => item.id === id);
        if (currentIndex < 0) return current;

        const clampedIndex = Math.max(0, Math.min(targetIndex, sectionCards.length - 1));
        if (clampedIndex === currentIndex) return current;

        const reordered = [...sectionCards];
        const [removed] = reordered.splice(currentIndex, 1);
        reordered.splice(clampedIndex, 0, removed);

        const byId = new Map(reordered.map((item, idx) => [item.id, idx + 1]));

        return current.map((item) =>
          item.boardSection === section ? { ...item, positionIndex: byId.get(item.id) ?? item.positionIndex } : item
        );
      });
    },
    [setCards]
  );

  const addRow = useCallback(
    (rowName: string) => {
      const name = rowName.trim();
      if (!name) return;
      setBoard((prev) => {
        if (prev.rows.includes(name)) return prev;
        const next: FacultyBoardState = {
          rows: [...prev.rows, name],
          cards: prev.cards,
        };
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  /** Rename a row (board section) and keep all cards in sync. Fails if `toSection` already exists. */
  const updateRowDetail = useCallback(
    (fromSection: string, toSection: string) => {
      const from = fromSection.trim();
      const to = toSection.trim();
      if (!from || !to || from === to) return;
      setBoard((prev) => {
        if (!prev.rows.includes(from) || prev.rows.includes(to)) return prev;
        const next: FacultyBoardState = {
          rows: prev.rows.map((r) => (r === from ? to : r)),
          cards: prev.cards.map((c) => (c.boardSection === from ? { ...c, boardSection: to } : c)),
        };
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  /** Remove row from order and delete all cards in that section. */
  const deleteRow = useCallback(
    (section: string) => {
      const sec = section.trim();
      if (!sec) return;
      setBoard((prev) => {
        const next: FacultyBoardState = {
          rows: prev.rows.filter((r) => r !== sec),
          cards: prev.cards.filter((c) => c.boardSection !== sec),
        };
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  /** Reorder rows: move the row at `fromIndex` so it sits before the row currently at `beforeIndex` (0…rows.length). */
  const moveRowToBefore = useCallback(
    (fromIndex: number, beforeIndex: number) => {
      setBoard((prev) => {
        const current = prev.rows;
        const n = current.length;
        if (n <= 1) return prev;
        if (fromIndex < 0 || fromIndex >= n) return prev;
        const clampedBefore = Math.max(0, Math.min(beforeIndex, n));
        const next = [...current];
        const [item] = next.splice(fromIndex, 1);
        let insertAt = clampedBefore;
        if (fromIndex < clampedBefore) insertAt = clampedBefore - 1;
        insertAt = Math.max(0, Math.min(insertAt, next.length));
        next.splice(insertAt, 0, item);
        const state: FacultyBoardState = { rows: next, cards: prev.cards };
        schedulePersist(state);
        return state;
      });
    },
    [schedulePersist]
  );

  const upsertCardWithOrdering = useCallback(
    (nextCard: FacultyCardItem) => {
      setBoard((prev) => {
        const current = prev.cards;
        const existing = current.find((c) => c.id === nextCard.id);
        const without = current.filter((c) => c.id !== nextCard.id);

        const sourceSection = existing?.boardSection ?? nextCard.boardSection;
        const destinationSection = nextCard.boardSection.trim();

        const sourceCards = without
          .filter((c) => c.boardSection === sourceSection)
          .sort((a, b) => a.positionIndex - b.positionIndex);

        const destinationCards = destinationSection
          ? without.filter((c) => c.boardSection === destinationSection).sort((a, b) => a.positionIndex - b.positionIndex)
          : [];

        const insertionIndex = Math.max(0, Math.min((nextCard.positionIndex ?? 1) - 1, destinationCards.length));
        const cardToInsert: FacultyCardItem = {
          ...nextCard,
          boardSection: destinationSection,
          positionIndex: insertionIndex + 1,
        };

        const destinationReordered = [...destinationCards];
        destinationReordered.splice(insertionIndex, 0, cardToInsert);

        const reindexedDestination = destinationReordered.map((c, idx) => ({ ...c, positionIndex: idx + 1 }));

        const reindexedSource =
          sourceSection === destinationSection
            ? []
            : sourceCards.map((c, idx) => ({
                ...c,
                positionIndex: idx + 1,
              }));

        const untouched = without.filter((c) => c.boardSection !== sourceSection && c.boardSection !== destinationSection);

        const nextCards = [...untouched, ...reindexedSource, ...reindexedDestination];
        const next: FacultyBoardState = { rows: [...prev.rows], cards: nextCards };
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  const addCardToSectionAtIndex = useCallback(
    (card: Omit<FacultyCardItem, "id">, targetSection: string, targetIndex1Based: number) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `f-${Date.now()}`;
      upsertCardWithOrdering({
        ...card,
        id,
        boardSection: targetSection.trim(),
        positionIndex: Math.max(1, Math.floor(targetIndex1Based) || 1),
      });
    },
    [upsertCardWithOrdering]
  );

  const moveCardToSectionAtIndex = useCallback(
    (id: string, targetSection: string, targetIndex: number) => {
      setCards((current) => {
        const card = current.find((item) => item.id === id);
        if (!card) return current;

        const sourceSection = card.boardSection;
        const destinationSection = targetSection.trim() || sourceSection;

        const sourceCards = current
          .filter((item) => item.boardSection === sourceSection)
          .sort((a, b) => a.positionIndex - b.positionIndex);
        const sourceIndex = sourceCards.findIndex((item) => item.id === id);
        if (sourceIndex < 0) return current;

        const movingCard: FacultyCardItem = { ...card, boardSection: destinationSection };
        const sourceWithoutCard = sourceCards.filter((item) => item.id !== id);

        if (sourceSection === destinationSection) {
          const clampedIndex = Math.max(0, Math.min(targetIndex, sourceWithoutCard.length));
          const reordered = [...sourceWithoutCard];
          reordered.splice(clampedIndex, 0, movingCard);
          const byId = new Map(reordered.map((item, idx) => [item.id, idx + 1]));

          return current.map((item) =>
            item.boardSection === sourceSection
              ? {
                  ...(item.id === id ? movingCard : item),
                  positionIndex: byId.get(item.id) ?? item.positionIndex,
                }
              : item
          );
        }

        const destinationCards = current
          .filter((item) => item.boardSection === destinationSection)
          .sort((a, b) => a.positionIndex - b.positionIndex);
        const clampedDestinationIndex = Math.max(0, Math.min(targetIndex, destinationCards.length));
        const destinationWithCard = [...destinationCards];
        destinationWithCard.splice(clampedDestinationIndex, 0, movingCard);

        const sourceById = new Map(sourceWithoutCard.map((item, idx) => [item.id, idx + 1]));
        const destinationById = new Map(destinationWithCard.map((item, idx) => [item.id, idx + 1]));

        return current.map((item) => {
          if (item.id === id) {
            return {
              ...movingCard,
              positionIndex: destinationById.get(id) ?? movingCard.positionIndex,
            };
          }
          if (item.boardSection === sourceSection) {
            return { ...item, positionIndex: sourceById.get(item.id) ?? item.positionIndex };
          }
          if (item.boardSection === destinationSection) {
            return { ...item, positionIndex: destinationById.get(item.id) ?? item.positionIndex };
          }
          return item;
        });
      });
    },
    [setCards]
  );

  return {
    cards,
    rows,
    groupedCards,
    isLoaded,
    isLayoutDirty,
    commitLayout,
    revertLayout,
    addCard,
    saveCard,
    deleteCard,
    moveCardWithinSection,
    moveCardWithinSectionToIndex,
    upsertCardWithOrdering,
    addRow,
    updateRowDetail,
    deleteRow,
    moveRowToBefore,
    addCardToSectionAtIndex,
    moveCardToSectionAtIndex,
  };
}
