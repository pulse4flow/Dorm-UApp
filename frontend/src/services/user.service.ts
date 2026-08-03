import { BaseService } from "./api-base";
import { UserProfile, UserRole } from "@/types";

export interface CreateUserData {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  studentId?: string;
  roomId?: string;
  dormScore?: number;
}

export const UserService = {
  getAll: async () => {
    return BaseService.get<UserProfile[]>("/users");
  },

  create: async (data: CreateUserData) => {
    return BaseService.post<UserProfile>("/users", data);
  },

  update: async (id: number | string, data: Partial<CreateUserData>) => {
    return BaseService.put<UserProfile>(`/users/${id}`, data);
  },

  delete: async (id: number | string) => {
    return BaseService.delete(`/users/${id}`);
  },
};
