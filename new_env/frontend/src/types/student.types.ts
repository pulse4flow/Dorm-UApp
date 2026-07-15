import { User } from "./user.types";

export interface Student {
  id: string;
  userId: number;
  studentId: string;
  name: string;
  roomId: string;
  dormScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentWithUser extends Student {
  user: User;
}

export interface StudentFormData {
  studentId: string;
  name: string;
  roomId: string;
}
