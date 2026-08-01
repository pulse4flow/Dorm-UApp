export interface User {
  id: number | string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  role: "manager" | "student";
  room?: string;
  dormScore?: number;
}

export type UserRole = "manager" | "student";
