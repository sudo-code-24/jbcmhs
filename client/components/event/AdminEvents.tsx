"use client";

import { useState } from "react";
import { deleteEvent } from "@/lib/api";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EventForm from "./EventForm";
import { strapiMediaFullUrl } from "@/lib/strapi/publicMediaUrl";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

type AdminEventsProps = {
  initial: Event[];
};

const AdminEvents = ({ initial }: AdminEventsProps) => {
  const [list, setList] = useState<Event[]>(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());

  const allSelected = list.length > 0 && list.every((ev) => selectedIds.has(ev.id));
  const selectedCount = selectedIds.size;

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(() => {
      if (list.length === 0) return new Set();
      if (allSelected) return new Set();
      return new Set(list.map((ev) => ev.id));
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    setLoading(true);
    setDeletingId(id);
    setError("");
    try {
      await deleteEvent(id);
      setList((prev) => prev.filter((ev) => ev.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} event(s)?`)) return;
    setLoading(true);
    setDeletingId(null);
    setError("");
    try {
      const results = await Promise.allSettled(ids.map((id) => deleteEvent(id)));
      const succeeded: number[] = [];
      const failed: number[] = [];
      ids.forEach((id, i) => {
        if (results[i].status === "fulfilled") succeeded.push(id);
        else failed.push(id);
      });
      setList((prev) => prev.filter((ev) => !succeeded.includes(ev.id)));
      setSelectedIds(new Set(failed));
      if (failed.length > 0) {
        setError(
          failed.length === ids.length
            ? "Could not delete selected events."
            : `Deleted ${succeeded.length}, but ${failed.length} could not be deleted.`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {list.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                disabled={loading}
                className={cn(
                  "h-4 w-4 rounded border border-input bg-background",
                  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                aria-label="Select all events"
              />
              <span className="text-muted-foreground">Select all</span>
            </label>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={loading || selectedCount === 0}
              onClick={handleDeleteSelected}
            >
              {loading && selectedCount > 0 && deletingId === null ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner />
                  Deleting…
                </span>
              ) : (
                `Delete selected${selectedCount > 0 ? ` (${selectedCount})` : ""}`
              )}
            </Button>
          </div>
        ) : (
          <span />
        )}
        <EventForm
          mode="create"
          fabOnMobile
          onSuccess={(created) => {
            setList((prev) => [created, ...prev]);
          }}
        />
      </div>

      <ul className="space-y-2">
        {list.map((ev) => (
          <li key={ev.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(ev.id)}
                    onChange={() => toggleSelected(ev.id)}
                    disabled={loading}
                    className={cn(
                      "mt-1 h-4 w-4 shrink-0 rounded border border-input bg-background",
                      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                    aria-label={`Select ${ev.title}`}
                  />
                  <div className="min-w-0 flex-1">
                  <p className="font-medium">{ev.title}</p>
                  <Badge className="mt-1 ml-0" variant="secondary">
                    {new Date(ev.date).toLocaleDateString()}
                    {ev.endDate ? ` - ${new Date(ev.endDate).toLocaleDateString()}` : ""}
                    {" · "}
                    {ev.type}
                  </Badge>
                  </div>
                </label>
                <div className="flex gap-2">
                  <EventForm
                    mode="update"
                    eventId={ev.id}
                    initialValues={{
                      title: ev.title,
                      description: ev.description ?? "",
                      date: ev.date,
                      endDate: ev.endDate ?? "",
                      type: ev.type,
                    }}
                    existingImageSrc={strapiMediaFullUrl(ev.image?.url)}
                    triggerLabel="Edit"
                    triggerVariant="ghost"
                    triggerSize="sm"
                    onSuccess={(updated) => {
                      setList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(ev.id)}
                  >
                    {deletingId === ev.id ? (
                      <span className="inline-flex items-center gap-2">
                        <LoadingSpinner />
                        Deleting...
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminEvents;
