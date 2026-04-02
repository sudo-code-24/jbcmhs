import type {
  Announcement,
  AnnouncementCategory,
  Event,
  EventType,
  FacultyBoardApiResponse,
  FacultyCardItem,
  SchoolInfo,
} from "./types";
import {
  ANNOUNCEMENT_LIST_POPULATE,
  announcementDetailQuery,
  FACULTY_BOARD_TREE_QUERY,
  SCHOOL_EVENTS_LIST_QUERY,
  SCHOOL_PROFILE_POPULATE,
} from "./strapi/queries";
import { strapiFetchJson } from "./strapi/strapiFetch";
import {
  strapiAnnouncementToClient,
  strapiAnnouncementsCollectionToClient,
  strapiEventToClient,
  strapiGradeLevelsToFacultyBoard,
  strapiSchoolEventsCollectionToClient,
  strapiSchoolProfileToClient,
} from "./strapi/transformers";

export type { FacultyBoardApiResponse };

export async function getSchoolInfo(): Promise<SchoolInfo | null> {
  try {
    const raw = await strapiFetchJson(`/api/school-profile?${SCHOOL_PROFILE_POPULATE}`, {
      next: { revalidate: 60 },
    });
    return strapiSchoolProfileToClient(raw);
  } catch {
    return null;
  }
}

export async function getFacultyBoard(): Promise<FacultyBoardApiResponse> {
  try {
    const raw = await strapiFetchJson(`/api/grade-levels?${FACULTY_BOARD_TREE_QUERY}`, { cache: "no-store" });
    const board = strapiGradeLevelsToFacultyBoard(raw);
    return board;
  } catch {
    return {
      rows: [],
      cards: [],
      sheetEmpty: true,
    };
  }
}

export async function getAnnouncements(limit: number | null = null): Promise<Announcement[]> {
  try {
    const pagination =
      limit != null && limit > 0 ? `pagination[pageSize]=${Math.min(limit, 100)}` : "pagination[pageSize]=100";
    const raw = await strapiFetchJson(`/api/announcements?${pagination}&sort=publishedAt:desc&${ANNOUNCEMENT_LIST_POPULATE}`, {
      cache: "no-store",
    });
    return strapiAnnouncementsCollectionToClient(raw);
  } catch {
    return [];
  }
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  try {
    const raw = await strapiFetchJson(
      `/api/announcements/${encodeURIComponent(id)}?${announcementDetailQuery()}`,
      { cache: "no-store" }
    );
    return strapiAnnouncementToClient(raw);
  } catch {
    return null;
  }
}

export async function getEvents(): Promise<Event[]> {
  try {
    const raw = await strapiFetchJson(`/api/school-events?${SCHOOL_EVENTS_LIST_QUERY}`, { cache: "no-store" });
    return strapiSchoolEventsCollectionToClient(raw);
  } catch {
    return [];
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const raw = await strapiFetchJson(
      `/api/school-events/${encodeURIComponent(id)}?populate[image]=true`,
      { cache: "no-store" },
    );
    return strapiEventToClient(raw);
  } catch {
    return null;
  }
}

const AUTH_API_BASE = "";

async function fetchApiWithAuth<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const url = path.startsWith("http") ? path : `${AUTH_API_BASE}${path}`;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const res = await fetch(url, {
    ...options,
    headers: isFormData
      ? { ...options.headers }
      : { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = res.statusText || "Request failed";
    try {
      const j = text ? JSON.parse(text) : null;
      if (j && typeof j === "object") {
        const o = j as { error?: unknown };
        if (typeof o.error === "string") {
          msg = o.error;
        } else if (o.error && typeof o.error === "object" && "message" in o.error) {
          const m = (o.error as { message?: unknown }).message;
          if (typeof m === "string") msg = m;
        }
      }
    } catch {
      if (text) msg = text;
    }
    const err = new Error(msg) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json() as Promise<T>;
}

export function createAnnouncement(formData: FormData): Promise<Announcement> {
  return fetchApiWithAuth<Announcement>("/api/announcements", {
    method: "POST",
    body: formData,
  }) as Promise<Announcement>;
}

export function updateAnnouncement(id: number, formData: FormData): Promise<Announcement> {
  return fetchApiWithAuth<Announcement>(`/api/announcements/${id}`, {
    method: "PUT",
    body: formData,
  }) as Promise<Announcement>;
}

export function deleteAnnouncement(id: number): Promise<null> {
  return fetchApiWithAuth<null>(`/api/announcements/${id}`, { method: "DELETE" }) as Promise<null>;
}

export function saveFacultyBoard(data: { rows: string[]; cards: FacultyCardItem[] }): Promise<{
  ok: boolean;
}> {
  return fetchApiWithAuth<{ ok: boolean }>("/api/faculty-board", {
    method: "PUT",
    body: JSON.stringify(data),
  }) as Promise<{ ok: boolean }>;
}

export function createEvent(formData: FormData): Promise<Event> {
  return fetchApiWithAuth<Event>("/api/events", {
    method: "POST",
    body: formData,
  }) as Promise<Event>;
}

export function updateEvent(id: number, formData: FormData): Promise<Event> {
  return fetchApiWithAuth<Event>(`/api/events/${id}`, {
    method: "PUT",
    body: formData,
  }) as Promise<Event>;
}

/** After faculty board sync, upload photos for cards that selected a new file. */
export function uploadFacultyMemberImage(importKey: string, formData: FormData): Promise<{ ok: boolean }> {
  return fetchApiWithAuth<{ ok: boolean }>(
    `/api/faculty-members/${encodeURIComponent(importKey)}/image`,
    { method: "POST", body: formData },
  ) as Promise<{ ok: boolean }>;
}

export function deleteEvent(id: number): Promise<null> {
  return fetchApiWithAuth<null>(`/api/events/${id}`, { method: "DELETE" }) as Promise<null>;
}

export function updateSchoolProfile(formData: FormData): Promise<SchoolInfo> {
  return fetchApiWithAuth<SchoolInfo>("/api/school-profile", {
    method: "PUT",
    body: formData,
  }) as Promise<SchoolInfo>;
}
