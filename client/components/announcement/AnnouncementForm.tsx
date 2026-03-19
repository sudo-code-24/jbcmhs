"use client";

import { useEffect } from "react";
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
  imageUrl: z.string().optional(),
});

export type AnnouncementFormValues = z.infer<typeof schema>;

type AnnouncementFormProps = {
  mode: "create" | "update";
  initialValues?: Partial<AnnouncementFormValues>;
  loading?: boolean;
  onSubmit: (values: AnnouncementFormValues) => Promise<void> | void;
  onCancel?: () => void;
};

const getDefaults = (initialValues?: Partial<AnnouncementFormValues>): AnnouncementFormValues => {
  const inputDate = initialValues?.datePosted
    ? new Date(initialValues.datePosted).toISOString().slice(0, 16)
    : "";

  return {
    title: initialValues?.title ?? "",
    content: initialValues?.content ?? "",
    category: initialValues?.category ?? "General",
    datePosted: inputDate,
    imageUrl: initialValues?.imageUrl ?? "",
  };
};

const AnnouncementForm = ({
  mode,
  initialValues,
  loading,
  onSubmit,
  onCancel,
}: AnnouncementFormProps) => {
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaults(initialValues),
  });

  useEffect(() => {
    form.reset(getDefaults(initialValues));
  }, [form, initialValues]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
