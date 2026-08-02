import { User } from "./user.types";
import { Room } from "./room.types";

export interface Student {
  id: string;
  userId: number;
  studentId: string;
  name: string;
  roomId: string;
  dormScore: number;
  createdAt: Date;
  updatedAt: Date;
  room?: Room;
}

export interface StudentWithUser extends Student {
  user: User;
  room?: Room;
}

export interface StudentFormData {
  studentId: string;
  name: string;
  roomId: string;
  dormScore?: number;
  password?: string;
  email?: string;
}
