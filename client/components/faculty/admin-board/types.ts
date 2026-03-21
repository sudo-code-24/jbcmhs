export type FacultyCardDraft = {
  name: string;
  role: string;
  boardSection: string;
  positionIndex: number;
  email: string;
  phone: string;
  photoUrl: string;
};

export const emptyFacultyCardDraft: FacultyCardDraft = {
  name: "",
  role: "",
  boardSection: "",
  positionIndex: 1,
  email: "",
  phone: "",
  photoUrl: "",
};
