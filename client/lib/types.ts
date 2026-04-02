export const ANNOUNCEMENT_CATEGORIES = ["General", "Academic", "Events", "Sports"] as const;
export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number];
export const EVENT_TYPES = ["academic", "event", "sports"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** Strapi single media (populate); `url` is usually relative (e.g. `/uploads/...`). */
export type StrapiMedia = {
  url?: string;
  alternativeText?: string;
} | null;

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: AnnouncementCategory;
  datePosted: string;
  image?: StrapiMedia;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  type: EventType;
  image?: StrapiMedia;
}

/** Public faculty board card (persisted to Google Sheet via API). */
export type FacultyCardItem = {
  id: string;
  name: string;
  role: string;
  department: string;
  email?: string;
  phone?: string;
  image?: StrapiMedia;
  boardSection: string;
  positionIndex: number;
};

export type FacultyBoardApiResponse = {
  rows: string[];
  cards: FacultyCardItem[];
  /** True when Strapi has no faculty board data yet (first use). */
  sheetEmpty: boolean;
};

/** Home page feature cards (Strapi component `school.home-feature`). */
export type SchoolShowcaseFeature = {
  title: string;
  text: string;
  icon: string;
};

export interface SchoolInfo {
  id: number;
  name: string;
  tagline: string;
  history: string;
  mission: string;
  vision: string;
  phone: string;
  email: string;
  address: string;
  officeHours: string;
  facebookUrl?: string;
  heroQuote?: string;
  heroHeading?: string;
  heroDescription?: string;
  heroImage?: StrapiMedia;
  schoolInfoImage?: StrapiMedia;
  showcaseFeatures: SchoolShowcaseFeature[];
}
