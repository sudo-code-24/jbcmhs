import type {
  Announcement,
  AnnouncementCategory,
  Event,
  EventType,
  FacultyCardItem,
  SchoolInfo,
} from "./types";

export type FacultyBoardApiResponse = {
  rows: string[];
  cards: FacultyCardItem[];
  /** True when the Google Sheet tab has no rows yet (first use). */
  sheetEmpty: boolean;
};

// API_URL = internal (e.g. http://server:5000 in Docker); NEXT_PUBLIC_API_URL = browser (e.g. https://jbcmhs.onrender.com)
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://jbcmhs.onrender.com";

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

export async function getFacultyBoard(): Promise<FacultyBoardApiResponse> {
  return (
    (await fetchApi<FacultyBoardApiResponse>("/api/faculty-board", { cache: "no-store" })) ?? {
      rows: [],
      cards: [],
      sheetEmpty: true,
    }
  );
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

// Base URL for authenticated mutations (uses Next.js proxy so cookies are sent)
const AUTH_API_BASE = "";

async function fetchApiWithAuth<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const url = path.startsWith("http") ? path : `${AUTH_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
  });
  if (!res.ok) {
    const err = new Error(res.statusText || "Request failed") as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json() as Promise<T>;
}

// Admin CRUD (no cache) - uses Next.js proxy to forward auth
export function createAnnouncement(data: {
  title: string;
  content: string;
  category: AnnouncementCategory;
  datePosted?: string;
  imageUrl?: string;
}): Promise<Announcement> {
  return fetchApiWithAuth<Announcement>("/api/announcements", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<Announcement>;
}
export function updateAnnouncement(
  id: number,
  data: { title?: string; content?: string; category?: AnnouncementCategory; datePosted?: string; imageUrl?: string }
): Promise<Announcement> {
  return fetchApiWithAuth<Announcement>(`/api/announcements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<Announcement>;
}
export function deleteAnnouncement(id: number): Promise<null> {
  return fetchApiWithAuth<null>(`/api/announcements/${id}`, { method: "DELETE" }) as Promise<null>;
}

export function saveFacultyBoard(data: {
  rows: string[];
  cards: FacultyCardItem[];
}): Promise<{ ok: boolean }> {
  return fetchApiWithAuth<{ ok: boolean }>("/api/faculty-board", {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<{ ok: boolean }>;
}
export function createEvent(data: {
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  type: EventType;
  imageUrl?: string;
}): Promise<Event> {
  return fetchApiWithAuth<Event>("/api/events", {
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
    imageUrl?: string;
  }
): Promise<Event> {
  return fetchApiWithAuth<Event>(`/api/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<Event>;
}
export function deleteEvent(id: number): Promise<null> {
  return fetchApiWithAuth<null>(`/api/events/${id}`, { method: "DELETE" }) as Promise<null>;
}
