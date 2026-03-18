"use client";

import { useState } from "react";
import { deleteEvent } from "@/lib/api";
import type { Event } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CreateEventForm from "@/components/CreateEventForm";

export default function AdminEvents({ initial }: { initial: Event[] }) {
  const [list, setList] = useState<Event[]>(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    setLoading(true);
    setError("");
    try {
      await deleteEvent(id);
      setList((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <CreateEventForm
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
                  <CreateEventForm
                    mode="update"
                    eventId={ev.id}
                    initialValues={{
                      title: ev.title,
                      description: ev.description ?? "",
                      date: ev.date,
                      endDate: ev.endDate ?? "",
                      type: ev.type,
                      imageFileId: ev.imageFileId ?? "",
                    }}
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
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(ev.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
