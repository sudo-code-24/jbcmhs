"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/lib/api";
import type { Announcement } from "@/lib/types";
import Modal from "@/components/ui/modal";
import AnnouncementForm, { type AnnouncementFormValues } from "./AnnouncementForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/loading-spinner";

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

  const resetForm = () => {
    setEditing(null);
    setError("");
    setOpen(false);
  };

  const handleSubmit = async (values: AnnouncementFormValues) => {
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...values,
        datePosted: values.datePosted ? new Date(values.datePosted).toISOString() : undefined,
      };
      if (editing) {
        const updated = await updateAnnouncement(editing.id, payload);
        setList((prev) => prev.map((a) => (a.id === editing.id ? updated : a)));
      } else {
        const created = await createAnnouncement(payload);
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

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      <div className="flex justify-end">
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
      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
      <Modal open={open} onClose={resetForm} title={editing ? "Edit announcement" : "Create announcement"}>
        <AnnouncementForm
          mode={editing ? "update" : "create"}
          initialValues={
            editing
              ? {
                  title: editing.title,
                  content: editing.content,
                  category: editing.category,
                  datePosted: editing.datePosted,
                  imageUrl: editing.imageUrl ?? "",
                }
              : undefined
          }
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={editing ? resetForm : undefined}
        />
      </Modal>

      <ul className="space-y-2">
        {list.map((a) => (
          <li key={a.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{a.title}</p>
                  <Badge className="mt-1 ml-0" variant="secondary">
                    {a.category}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(a)}>
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
