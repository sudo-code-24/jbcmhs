/** School profile single type: hero + info images and showcase components. */
export const SCHOOL_PROFILE_POPULATE =
  "populate[heroImage]=true&populate[schoolInfoImage]=true&populate[showcaseFeatures]=true";

/** Single announcement with category and hero image. */
export function announcementDetailQuery(): string {
  return "populate[category][fields][0]=name&populate[image]=true";
}

/** List query fragment: category + image (use with pagination/sort query string). */
export const ANNOUNCEMENT_LIST_POPULATE =
  "populate[category][fields][0]=name&populate[image]=true";

/** School events, soonest first. */
export const SCHOOL_EVENTS_LIST_QUERY =
  "sort=startsAt:asc&pagination[pageSize]=100&populate[image]=true";

/** Grade levels with sections and faculty for the public faculty board. */
export const FACULTY_BOARD_TREE_QUERY =
  "sort=sortOrder:asc&pagination[pageSize]=50&populate[boardSections][sort]=sortOrder:asc&populate[boardSections][populate][facultyMembers][sort]=positionIndex:asc&populate[boardSections][populate][facultyMembers][populate][image]=true";
