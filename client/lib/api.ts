import type { Announcement, AnnouncementCategory, Event, EventType, SchoolInfo } from "./types";

// API_URL = internal (e.g. http://server:5000 in Docker); NEXT_PUBLIC_API_URL = browser (e.g. http://localhost:5005)
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

type FetchOptions = RequestInit & { next?: { revalidate?: number } };

async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    next: options.next ?? undefined,
  });
  if (!res.ok) {
    const err = new Error(res.statusText || "Request failed") as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json() as Promise<T>;
}

export async function getSchoolInfo(): Promise<SchoolInfo | null> {
  return fetchApi<SchoolInfo>("/api/school-info", { next: { revalidate: 60 } });
}

export async function getAnnouncements(limit: number | null = null): Promise<Announcement[]> {
  const q = limit ? `?limit=${limit}` : "";
  return (await fetchApi<Announcement[]>(`/api/announcements${q}`, { cache: "no-store" })) ?? [];
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  return fetchApi<Announcement>(`/api/announcements/${id}`, { cache: "no-store" });
}

export async function getEvents(): Promise<Event[]> {
  return (await fetchApi<Event[]>("/api/events", { cache: "no-store" })) ?? [];
}

export async function getEvent(id: string): Promise<Event | null> {
  return fetchApi<Event>(`/api/events/${id}`, { cache: "no-store" });
}

// Admin CRUD (no cache)
export function createAnnouncement(data: {
  title: string;
  content: string;
  category: AnnouncementCategory;
  datePosted?: string;
  imageFileId?: string;
}): Promise<Announcement> {
  return fetchApi<Announcement>("/api/announcements", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<Announcement>;
}
export function updateAnnouncement(
  id: number,
  data: { title?: string; content?: string; category?: AnnouncementCategory; datePosted?: string; imageFileId?: string }
): Promise<Announcement> {
  return fetchApi<Announcement>(`/api/announcements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<Announcement>;
}
export function deleteAnnouncement(id: number): Promise<null> {
  return fetchApi<null>(`/api/announcements/${id}`, { method: "DELETE" }) as Promise<null>;
}
export function createEvent(data: {
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  type: EventType;
  imageFileId?: string;
}): Promise<Event> {
  return fetchApi<Event>("/api/events", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<Event>;
}
export function updateEvent(
  id: number,
  data: {
    title?: string;
    description?: string;
    date?: string;
    endDate?: string;
    type?: EventType;
    imageFileId?: string;
  }
): Promise<Event> {
  return fetchApi<Event>(`/api/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<Event>;
}
export function deleteEvent(id: number): Promise<null> {
  return fetchApi<null>(`/api/events/${id}`, { method: "DELETE" }) as Promise<null>;
}
