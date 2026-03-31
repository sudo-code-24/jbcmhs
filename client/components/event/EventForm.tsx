"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createEvent, updateEvent } from "@/lib/api";
import { EVENT_TYPES, type Event } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { postSiteBroadcast } from "@/lib/siteBroadcast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().optional(),
  type: z.enum(EVENT_TYPES),
  imageUrl: z.string().optional(),
});

type FormState = z.infer<typeof schema>;

export type EventFormProps = {
  mode?: "create" | "update";
  eventId?: number;
  initialValues?: Partial<FormState>;
  loading?: boolean;
  inline?: boolean;
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  triggerClassName?: string;
  fabOnMobile?: boolean;
  onSuccess?: (event: Event) => void;
  onCancel?: () => void;
};

const toInputDate = (d?: string | Date): string => {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

const getDefaults = (initialValues?: Partial<FormState>): FormState => ({
  title: initialValues?.title ?? "",
  description: initialValues?.description ?? "",
  date: toInputDate(initialValues?.date),
  endDate: toInputDate(initialValues?.endDate),
  type: initialValues?.type ?? "event",
  imageUrl: initialValues?.imageUrl ?? "",
});

const EventForm = ({
  mode = "create",
  eventId,
  initialValues,
  loading: loadingProp,
  inline = false,
  triggerLabel = "Create Event",
  triggerVariant = "default",
  triggerSize = "default",
  triggerClassName,
  fabOnMobile = false,
  onSuccess,
  onCancel,
}: EventFormProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState("");
  const loading = loadingProp ?? loadingLocal;

  const form = useForm<FormState>({
    resolver: zodResolver(schema),
    defaultValues: getDefaults(initialValues),
  });

  useEffect(() => {
    form.reset(getDefaults(initialValues));
  }, [form, initialValues]);

  const handleSubmit = useCallback(
    async (values: FormState) => {
      setError("");
      setLoadingLocal(true);
      try {
        const payload = {
          ...values,
          description: values.description || "",
          date: values.date ? new Date(values.date).toISOString() : new Date().toISOString(),
          endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
        };
        if (mode === "update" && !eventId) {
          throw new Error("Missing event id for update.");
        }
        const event =
          mode === "update" ? await updateEvent(eventId!, payload) : await createEvent(payload);
        if (mode === "create") {
          form.reset(getDefaults());
          toast({ title: "Event created", description: event.title });
          postSiteBroadcast({ type: "new_event", title: event.title });
        } else {
          toast({ title: "Event updated", description: event.title });
        }
        if (!inline) setOpen(false);
        onSuccess?.(event);
        if (!onSuccess) router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to ${mode} event`);
      } finally {
        setLoadingLocal(false);
      }
    },
    [mode, eventId, inline, onSuccess, router]
  );

  const formContent = (
    <>
      {error ? (
        <p className="mb-4 rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
      ) : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description" rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date and time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End date and time (optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <CardFooter className="px-0 pb-0">
            <div className="flex w-full justify-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner />
                    {mode === "update" ? "Updating..." : "Adding..."}
                  </span>
                ) : (
                  mode === "update" ? "Update Event" : "Add Event"
                )}
              </Button>
              {mode === "update" && onCancel ? (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </CardFooter>
        </form>
      </Form>
    </>
  );

  if (inline) return formContent;

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        className={`${fabOnMobile ? "fixed bottom-6 right-6 z-50 rounded-full shadow-xl md:static md:rounded-md md:shadow-none" : ""} ${triggerClassName ?? ""}`}
        onClick={() => setOpen(true)}
      >
        {fabOnMobile ? (
          <>
            <Plus className="h-4 w-4 md:hidden" />
            <span className="hidden md:inline">{triggerLabel}</span>
          </>
        ) : (
          triggerLabel
        )}
      </Button>
      <Dialog open={open} onOpenChange={(next) => !next && setOpen(false)}>
        <DialogContent maxWidth="2xl">
          <DialogHeader>
            <DialogTitle>{mode === "update" ? "Edit event" : "Create event"}</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventForm;
