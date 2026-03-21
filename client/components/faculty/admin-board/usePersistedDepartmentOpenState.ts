import { useCallback, useEffect, useMemo, useState } from "react";

/** Bumped when default-open semantics change so old collapsed prefs are not inherited. */
export const DEFAULT_DEPARTMENT_OPEN_STORAGE_KEY =
  "jbcmhs.facultyAdminBoard.departmentsOpen.v2";

function readStoredMap(key: string): Record<string, boolean> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Record<string, boolean>;
  } catch {
    return null;
  }
}

function writeStoredMap(key: string, map: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

export type UsePersistedDepartmentOpenStateOptions = {
  /** When no saved preference exists for a department, use this. Default true (expanded). */
  defaultExpanded?: boolean;
  /** localStorage key for JSON map of department name → open. */
  storageKey?: string;
};

/**
 * Per-department open/closed state with localStorage persistence.
 * Keys are department (row) names; values are whether the section is expanded.
 */
export function usePersistedDepartmentOpenState(
  rows: string[],
  options: UsePersistedDepartmentOpenStateOptions = {},
) {
  const defaultExpanded = options.defaultExpanded ?? true;
  const storageKey =
    options.storageKey ?? DEFAULT_DEPARTMENT_OPEN_STORAGE_KEY;

  const rowsKey = useMemo(() => rows.join("\0"), [rows]);

  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = readStoredMap(storageKey);
    setOpenMap((prev) => {
      const next: Record<string, boolean> = {};
      for (const r of rows) {
        if (stored && Object.prototype.hasOwnProperty.call(stored, r)) {
          next[r] = stored[r];
        } else if (Object.prototype.hasOwnProperty.call(prev, r)) {
          next[r] = prev[r];
        } else {
          next[r] = defaultExpanded;
        }
      }
      return next;
    });
  }, [rowsKey, defaultExpanded, storageKey]);

  const isDepartmentOpen = useCallback(
    (section: string) =>
      Object.prototype.hasOwnProperty.call(openMap, section)
        ? openMap[section]
        : defaultExpanded,
    [openMap, defaultExpanded],
  );

  const toggleDepartment = useCallback(
    (section: string) => {
      setOpenMap((prev) => {
        const was = Object.prototype.hasOwnProperty.call(prev, section)
          ? prev[section]
          : defaultExpanded;
        const nextOpen = !was;
        const pruned: Record<string, boolean> = {};
        for (const r of rows) {
          pruned[r] =
            r === section ? nextOpen : (prev[r] ?? defaultExpanded);
        }
        writeStoredMap(storageKey, pruned);
        return pruned;
      });
    },
    [defaultExpanded, storageKey, rows],
  );

  return { isDepartmentOpen, toggleDepartment, openMap };
}
