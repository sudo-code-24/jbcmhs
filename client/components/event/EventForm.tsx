"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createEvent, updateEvent } from "@/lib/api";
import { schoolEventFieldsToFormData } from "@/lib/strapi/entityFormData";
import { strapiMediaFullUrl } from "@/lib/strapi/publicMediaUrl";
import { EVENT_TYPES, type Event } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
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
});

type FormState = z.infer<typeof schema>;

export type EventFormProps = {
  mode?: "create" | "update";
  eventId?: number;
  initialValues?: Partial<FormState>;
  existingImageSrc?: string;
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
});

const EventForm = ({
  mode = "create",
  eventId,
  initialValues,
  existingImageSrc,
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const loading = loadingProp ?? loadingLocal;

  const form = useForm<FormState>({
    resolver: zodResolver(schema),
    defaultValues: getDefaults(initialValues),
  });

  useEffect(() => {
    form.reset(getDefaults(initialValues));
    setImageFile(null);
  }, [form, initialValues]);

  useEffect(() => {
    if (imageFile) {
      const u = URL.createObjectURL(imageFile);
      setPreviewUrl(u);
      return () => URL.revokeObjectURL(u);
    }
    setPreviewUrl(null);
  }, [imageFile]);

  const displaySrc = previewUrl ?? existingImageSrc ?? null;

  const handleSubmit = useCallback(
    async (values: FormState) => {
      setError("");
      setLoadingLocal(true);
      try {
        const payload = {
          title: values.title,
          description: values.description || "",
          date: values.date ? new Date(values.date).toISOString() : new Date().toISOString(),
          endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined,
          type: values.type,
        };
        const fd = schoolEventFieldsToFormData(payload, imageFile);
        if (mode === "update" && !eventId) {
          throw new Error("Missing event id for update.");
        }
        const event =
          mode === "update" ? await updateEvent(eventId!, fd) : await createEvent(fd);
        if (mode === "create") {
          form.reset(getDefaults());
          setImageFile(null);
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
    [mode, eventId, inline, onSuccess, router, form, imageFile],
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
          <div className="space-y-2">
            <label htmlFor="event-image" className="text-sm font-medium">
              Image (optional)
            </label>
            <Input
              id="event-image"
              type="file"
              accept="image/*"
              className="cursor-pointer"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              {mode === "update" ? "Leave empty to keep the current image." : undefined}
            </p>
            {displaySrc ? (
              <div className="overflow-hidden rounded-md border bg-muted/30 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displaySrc}
                  alt=""
                  className="mx-auto max-h-48 w-auto max-w-full object-contain"
                />
              </div>
            ) : null}
          </div>
          <CardFooter className="px-0 pb-0">
            <div className="flex w-full justify-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner />
                    {mode === "update" ? "Updating..." : "Adding..."}
                  </span>
                ) : mode === "update" ? (
                  "Update Event"
                ) : (
                  "Add Event"
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
