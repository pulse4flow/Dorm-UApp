import { BaseService } from "./api-base";
import { User, UserProfile, UserRole } from "@/types";

export interface LoginCredentials {
  userId: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  studentId?: string;
  roomId?: string;
}

export const AuthService = {
  login: async (credentials: LoginCredentials) => {
    return BaseService.post<LoginResponse>("/auth/login", credentials);
  },

  register: async (data: RegisterData) => {
    return BaseService.post<LoginResponse>("/auth/register", data);
  },

  logout: async () => {
    return BaseService.post("/auth/logout", {});
  },

  getProfile: async () => {
    return BaseService.get<UserProfile>("/auth/profile");
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    return BaseService.put<UserProfile>("/auth/profile", data);
  },

  refreshToken: async () => {
    return BaseService.post<{ token: string }>("/auth/refresh", {});
  },
};
