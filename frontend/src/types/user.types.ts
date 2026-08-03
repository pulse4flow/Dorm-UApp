export type UserType = "student" | "staff";
export type UserRole = "manager" | "student";

export interface User {
  id: number | string;
  username: string;
  name: string;
  role?: UserRole;
  type?: UserType;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  role: UserRole;
  type: UserType;
  room?: string;
  roomId?: string;
  roomNumber?: string;
  studentId?: string | null;
  dormScore?: number;
}
