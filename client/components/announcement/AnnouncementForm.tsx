"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
  content: z.string().min(1, "Content is required"),
  category: z.enum(ANNOUNCEMENT_CATEGORIES),
  datePosted: z.string().optional(),
});

export type AnnouncementFormValues = z.infer<typeof schema>;

type AnnouncementFormProps = {
  mode: "create" | "update";
  initialValues?: Partial<AnnouncementFormValues>;
  /** Resolved URL for current Strapi image (edit mode) */
  existingImageSrc?: string;
  loading?: boolean;
  onSubmit: (values: AnnouncementFormValues, imageFile: File | null) => Promise<void> | void;
  onCancel?: () => void;
};

const getDefaults = (initialValues?: Partial<AnnouncementFormValues>): AnnouncementFormValues => {
  const inputDate = initialValues?.datePosted
    ? new Date(initialValues.datePosted).toISOString().slice(0, 10)
    : "";

  return {
    title: initialValues?.title ?? "",
    content: initialValues?.content ?? "",
    category: initialValues?.category ?? "General",
    datePosted: inputDate,
  };
};

const AnnouncementForm = ({
  mode,
  initialValues,
  existingImageSrc,
  loading,
  onSubmit,
  onCancel,
}: AnnouncementFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<AnnouncementFormValues>({
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values, imageFile))}
        className="space-y-4"
      >
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Content" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  {ANNOUNCEMENT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
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
          name="datePosted"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date (optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <label htmlFor="announcement-image" className="text-sm font-medium">
            Image (optional)
          </label>
          <Input
            id="announcement-image"
            type="file"
            accept="image/*"
            className="cursor-pointer"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            {mode === "update"
              ? "Leave empty to keep the current image."
              : "Upload a file to attach a hero image."}
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
              ) : (
                `${mode === "update" ? "Update" : "Add"} Announcement`
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
  );
};

export default AnnouncementForm;
