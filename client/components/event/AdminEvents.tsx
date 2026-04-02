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

type AdminEventsProps = {
  initial: Event[];
};

const AdminEvents = ({ initial }: AdminEventsProps) => {
  const [list, setList] = useState<Event[]>(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    setLoading(true);
    setDeletingId(id);
    setError("");
    try {
      await deleteEvent(id);
      setList((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
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
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{ev.title}</p>
                  <Badge className="mt-1 ml-0" variant="secondary">
                    {new Date(ev.date).toLocaleDateString()}
                    {ev.endDate ? ` - ${new Date(ev.endDate).toLocaleDateString()}` : ""}
                    {" · "}
                    {ev.type}
                  </Badge>
                </div>
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
