export type UserRow = {
  username: string;
  email: string;
  createdAt: string;
  role?: string;
};

export type UserRole = "admin" | "faculty";
