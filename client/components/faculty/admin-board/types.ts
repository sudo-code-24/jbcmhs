export type FacultyCardDraft = {
  name: string;
  role: string;
  department: string;
  boardSection: string;
  positionIndex: number;
  email: string;
  phone: string;
  photoUrl: string;
};

export const emptyFacultyCardDraft: FacultyCardDraft = {
  name: "",
  role: "",
  department: "",
  boardSection: "",
  positionIndex: 1,
  email: "",
  phone: "",
  photoUrl: "",
};
