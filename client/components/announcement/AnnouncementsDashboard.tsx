"use client";

import { useMemo } from "react";
import { Grid2x2, List, Search, SlidersHorizontal } from "lucide-react";
import type { Announcement } from "@/lib/types";
import { MONTH_OPTIONS } from "@/config/monthOptions";
import AnnouncementCard from "./AnnouncementCard";
import FilterModal from "@/components/shared/FilterModal";
import { useFilterableContent } from "@/components/shared/hooks/useFilterableContent";
import MultiSelectDropdown, { type MultiSelectOption } from "@/components/shared/MultiSelectDropdown";
import { Button } from "@/components/ui/button";

type AnnouncementsDashboardProps = {
  announcements: Announcement[];
};

const AnnouncementsDashboard = ({ announcements }: AnnouncementsDashboardProps) => {
  const {
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
  } = useFilterableContent<Announcement>({
    items: announcements,
    searchKeys: ["title", "content", "category"],
    categoryKey: "category",
    dateKey: "datePosted",
  });

  const categoryOptions = useMemo<MultiSelectOption[]>(() => {
    const values = Array.from(new Set(announcements.map((a) => a.category))).sort();
    return values.map((value) => ({ label: value, value }));
  }, [announcements]);

  const monthOptions = useMemo<MultiSelectOption[]>(() => MONTH_OPTIONS, []);

  const yearOptions = useMemo<MultiSelectOption[]>(() => {
    const years = Array.from(
      new Set(announcements.map((a) => new Date(a.datePosted).getFullYear()))
    )
      .filter((y) => !Number.isNaN(y))
      .sort((a, b) => b - a);
    return years.map((year) => ({ label: String(year), value: String(year) }));
  }, [announcements]);

  const viewToggleClass = (active: boolean) =>
    active ? "border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-100" : "";

  const handleResetAndClose = () => {
    resetFilters();
    closeFilters();
  };

  return (
    <div className="py-6 sm:py-8 md:py-10">
      <div className="container-wide">
        <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-xl backdrop-blur-md sm:p-5 dark:border-white/10 dark:bg-slate-900/70">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Announcements</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="md:hidden"
                onClick={openFilters}
                aria-label="Open filters"
              >
                <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                Filters
                {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={`hidden md:flex ${viewToggleClass(viewMode === "list")}`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List className="mr-1.5 h-4 w-4" />
                List
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={`hidden md:flex ${viewToggleClass(viewMode === "grid")}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid2x2 className="mr-1.5 h-4 w-4" />
                Grid
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-violet-400/40 dark:border-white/15 dark:bg-slate-800/60 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mb-4 hidden gap-3 md:grid md:grid-cols-3">
            <MultiSelectDropdown
              label="Category"
              allLabel="All Categories"
              options={categoryOptions}
              selectedValues={selectedCategories}
              onChange={setSelectedCategories}
            />
            <MultiSelectDropdown
              label="Month"
              allLabel="All Months"
              options={monthOptions}
              selectedValues={selectedMonths}
              onChange={setSelectedMonths}
            />
            <MultiSelectDropdown
              label="Year"
              allLabel="All Years"
              options={yearOptions}
              selectedValues={selectedYears}
              onChange={setSelectedYears}
            />
          </div>

          {filtered.length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 gap-4 md:grid-cols-2" : "space-y-2.5"}>
              {filtered.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} view={viewMode} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-muted-foreground dark:border-white/15 dark:bg-slate-800/40 dark:text-slate-300">
              No announcements found.
            </div>
          )}

          <FilterModal
            open={isFiltersOpen}
            onClose={closeFilters}
            title="Filter announcements"
            onReset={resetFilters}
            onApply={closeFilters}
          >
            <MultiSelectDropdown
              label="Category"
              allLabel="All Categories"
              options={categoryOptions}
              selectedValues={selectedCategories}
              onChange={setSelectedCategories}
            />
            <MultiSelectDropdown
              label="Month"
              allLabel="All Months"
              options={monthOptions}
              selectedValues={selectedMonths}
              onChange={setSelectedMonths}
            />
            <MultiSelectDropdown
              label="Year"
              allLabel="All Years"
              options={yearOptions}
              selectedValues={selectedYears}
              onChange={setSelectedYears}
            />
          </FilterModal>
        </section>
      </div>
    </div>
  );
};

export default AnnouncementsDashboard;
