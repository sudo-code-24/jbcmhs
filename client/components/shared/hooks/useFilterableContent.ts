"use client";

import { useMemo, useState } from "react";

export type ViewMode = "list" | "grid";

export type UseFilterableContentOptions<T> = {
  items: T[];
  searchKeys: (keyof T)[];
  categoryKey?: keyof T;
  dateKey?: keyof T;
  sortByDateDesc?: boolean;
};

export const useFilterableContent = <T extends object>({
  items,
  searchKeys,
  categoryKey,
  dateKey = "datePosted" as keyof T,
  sortByDateDesc = true,
}: UseFilterableContentOptions<T>) => {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      if (!sortByDateDesc) return 0;
      const dateA = new Date((a[dateKey] as string) ?? 0).getTime();
      const dateB = new Date((b[dateKey] as string) ?? 0).getTime();
      return dateB - dateA;
    });
    const q = query.trim().toLowerCase();
    return sorted.filter((item) => {
      if (categoryKey && selectedCategories.length > 0) {
        const cat = item[categoryKey] as string;
        if (!selectedCategories.includes(cat)) return false;
      }
      if (dateKey) {
        const date = new Date((item[dateKey] as string) ?? 0);
        if (selectedMonths.length > 0 && !selectedMonths.includes(String(date.getMonth() + 1))) return false;
        if (selectedYears.length > 0 && !selectedYears.includes(String(date.getFullYear()))) return false;
      }
      if (!q) return true;
      const haystack = searchKeys
        .map((k) => String(item[k] ?? ""))
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [
    items,
    query,
    selectedCategories,
    selectedMonths,
    selectedYears,
    searchKeys,
    categoryKey,
    dateKey,
    sortByDateDesc,
  ]);

  const activeFilterCount = [selectedCategories, selectedMonths, selectedYears].filter(
    (arr) => arr.length > 0
  ).length;

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedMonths([]);
    setSelectedYears([]);
  };

  const openFilters = () => setIsFiltersOpen(true);
  const closeFilters = () => setIsFiltersOpen(false);

  return {
    query,
    setQuery,
    viewMode,
    setViewMode,
    selectedCategories,
    setSelectedCategories,
    selectedMonths,
    setSelectedMonths,
    selectedYears,
    setSelectedYears,
    isFiltersOpen,
    openFilters,
    closeFilters,
    filtered,
    activeFilterCount,
    resetFilters,
  };
};
