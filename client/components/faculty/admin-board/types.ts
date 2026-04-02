export type FacultyCardDraft = {
  name: string;
  role: string;
  boardSection: string;
  positionIndex: number;
  email: string;
  phone: string;
  /** New photo chosen in the form; uploaded after board save. */
  imageFile: File | null;
  /** Full URL to show current Strapi image while editing */
  existingImageSrc?: string;
};

export const emptyFacultyCardDraft: FacultyCardDraft = {
  name: "",
  role: "",
  boardSection: "",
  positionIndex: 1,
  email: "",
  phone: "",
  imageFile: null,
  existingImageSrc: undefined,
};
