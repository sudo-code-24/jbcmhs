import type { AnnouncementCategory, EventType } from "@/lib/types";

/** Browser helper: flat fields for Next BFF; optional `files.image` per Strapi upload plugin. */
export function announcementFieldsToFormData(
  fields: {
    title: string;
    content: string;
    category: AnnouncementCategory;
    datePosted?: string;
  },
  imageFile?: File | null,
): FormData {
  const fd = new FormData();
  fd.append("title", fields.title);
  fd.append("content", fields.content);
  fd.append("category", fields.category);
  if (fields.datePosted) fd.append("datePosted", fields.datePosted);
  if (imageFile && imageFile.size > 0) fd.append("files.image", imageFile);
  return fd;
}

export function facultyMemberImageFormData(imageFile: File): FormData {
  const fd = new FormData();
  fd.append("files.image", imageFile);
  return fd;
}

export function schoolEventFieldsToFormData(
  fields: {
    title: string;
    description: string;
    date: string;
    endDate?: string;
    type: EventType;
  },
  imageFile?: File | null,
): FormData {
  const fd = new FormData();
  fd.append("title", fields.title);
  fd.append("description", fields.description);
  fd.append("date", fields.date);
  if (fields.endDate) fd.append("endDate", fields.endDate);
  fd.append("type", fields.type);
  if (imageFile && imageFile.size > 0) fd.append("files.image", imageFile);
  return fd;
}
