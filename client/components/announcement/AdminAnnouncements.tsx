"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/lib/api";
import type { Announcement } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AnnouncementForm, {
  type AnnouncementFormValues,
} from "./AnnouncementForm";
import { announcementFieldsToFormData } from "@/lib/strapi/entityFormData";
import { strapiMediaFullUrl } from "@/lib/strapi/publicMediaUrl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

type AdminAnnouncementsProps = {
  initial: Announcement[];
};

const AdminAnnouncements = ({ initial }: AdminAnnouncementsProps) => {
  const [list, setList] = useState<Announcement[]>(initial);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());

  const allSelected = list.length > 0 && list.every((a) => selectedIds.has(a.id));
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
      return new Set(list.map((a) => a.id));
    });
  };

  const resetForm = () => {
    setEditing(null);
    setError("");
    setOpen(false);
  };

  const handleSubmit = async (values: AnnouncementFormValues, imageFile: File | null) => {
    setError("");
    setLoading(true);
    try {
      const datePosted = values.datePosted
        ? new Date(`${values.datePosted}T12:00:00`).toISOString()
        : undefined;
      const fd = announcementFieldsToFormData(
        {
          title: values.title,
          content: values.content,
          category: values.category,
          datePosted,
        },
        imageFile,
      );
      if (editing) {
        const updated = await updateAnnouncement(editing.id, fd);
        setList((prev) => prev.map((a) => (a.id === editing.id ? updated : a)));
      } else {
        const created = await createAnnouncement(fd);
        setList((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    setLoading(true);
    setDeletingId(id);
    setError("");
    try {
      await deleteAnnouncement(id);
      setList((prev) => prev.filter((a) => a.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (editing?.id === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  const startEdit = (a: Announcement) => {
    setEditing(a);
    setOpen(true);
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} announcement(s)?`)) return;
    setLoading(true);
    setDeletingId(null);
    setError("");
    try {
      const results = await Promise.allSettled(ids.map((id) => deleteAnnouncement(id)));
      const succeeded: number[] = [];
      const failed: number[] = [];
      ids.forEach((id, i) => {
        if (results[i].status === "fulfilled") succeeded.push(id);
        else failed.push(id);
      });
      setList((prev) => prev.filter((a) => !succeeded.includes(a.id)));
      setSelectedIds(new Set(failed));
      if (editing && succeeded.includes(editing.id)) resetForm();
      if (failed.length > 0) {
        setError(
          failed.length === ids.length
            ? "Could not delete selected announcements."
            : `Deleted ${succeeded.length}, but ${failed.length} could not be deleted.`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-0">
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
                aria-label="Select all announcements"
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
        <Button
          type="button"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-xl md:static md:rounded-md md:shadow-none"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4 md:hidden" />
          <span className="hidden md:inline">Create Announcement</span>
        </Button>
      </div>
      {error && (
        <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Dialog open={open} onOpenChange={(next) => !next && resetForm()}>
        <DialogContent maxWidth="2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit announcement" : "Create announcement"}
            </DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            mode={editing ? "update" : "create"}
            initialValues={
              editing
                ? {
                    title: editing.title,
                    content: editing.content,
                    category: editing.category,
                    datePosted: editing.datePosted,
                  }
                : undefined
            }
            existingImageSrc={editing ? strapiMediaFullUrl(editing.image?.url) : undefined}
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={editing ? resetForm : undefined}
          />
        </DialogContent>
      </Dialog>

      <ul className="space-y-2">
        {list.map((a) => (
          <li key={a.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(a.id)}
                    onChange={() => toggleSelected(a.id)}
                    disabled={loading}
                    className={cn(
                      "mt-1 h-4 w-4 shrink-0 rounded border border-input bg-background",
                      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                    aria-label={`Select ${a.title}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{a.title}</p>
                    <Badge className="mt-1 ml-0" variant="secondary">
                      {a.category}
                    </Badge>
                  </div>
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={loading}
                    size="sm"
                    onClick={() => startEdit(a)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(a.id)}
                  >
                    {deletingId === a.id ? (
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

export default AdminAnnouncements;
