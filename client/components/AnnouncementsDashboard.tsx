"use client";

import { useMemo, useState } from "react";
import { Grid2x2, List, Search, SlidersHorizontal } from "lucide-react";
import type { Announcement } from "@/lib/types";
import AnnouncementCard from "@/components/AnnouncementCard";
import MultiSelectDropdown, { type MultiSelectOption } from "@/components/MultiSelectDropdown";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";

type ViewMode = "list" | "grid";

type AnnouncementsDashboardProps = {
  announcements: Announcement[];
};

export default function AnnouncementsDashboard({ announcements }: AnnouncementsDashboardProps) {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  const categoryOptions = useMemo<MultiSelectOption[]>(() => {
    const values = Array.from(new Set(announcements.map((announcement) => announcement.category))).sort();
    return values.map((value) => ({ label: value, value }));
  }, [announcements]);

  const monthOptions = useMemo<MultiSelectOption[]>(
    () =>
      [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ].map((label, index) => ({ label, value: String(index + 1) })),
    []
  );

  const yearOptions = useMemo<MultiSelectOption[]>(() => {
    const years = Array.from(new Set(announcements.map((announcement) => new Date(announcement.datePosted).getFullYear())))
      .filter((year) => !Number.isNaN(year))
      .sort((a, b) => b - a);
    return years.map((year) => ({ label: String(year), value: String(year) }));
  }, [announcements]);

  const filtered = useMemo(() => {
    const sorted = [...announcements].sort(
      (a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
    );
    const q = query.trim().toLowerCase();

    return sorted.filter((announcement) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(announcement.category)) return false;

      const date = new Date(announcement.datePosted);
      if (selectedMonths.length > 0 && !selectedMonths.includes(String(date.getMonth() + 1))) return false;
      if (selectedYears.length > 0 && !selectedYears.includes(String(date.getFullYear()))) return false;

      if (!q) return true;
      const haystack = `${announcement.title} ${announcement.content} ${announcement.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [announcements, query, selectedCategories, selectedMonths, selectedYears]);

  const activeFilterCount = [selectedCategories, selectedMonths, selectedYears].filter((items) => items.length > 0).length;

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
                onClick={() => setIsFiltersOpen(true)}
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
                className={
                  `hidden md:flex ${viewMode === "list"
                    ? "border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-100"
                    : ""}`
                }
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
                className={
                  `hidden md:flex ${viewMode === "grid"
                    ? "border-violet-400/40 bg-violet-500/10 text-violet-700 dark:text-violet-100"
                    : ""}`
                }
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
                onChange={(event) => setQuery(event.target.value)}
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

          <Modal open={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} title="Filter announcements">
            <div className="space-y-3">
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
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedMonths([]);
                    setSelectedYears([]);
                  }}
                >
                  Reset
                </Button>
                <Button type="button" onClick={() => setIsFiltersOpen(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </Modal>
        </section>
      </div>
    </div>
  );
}
