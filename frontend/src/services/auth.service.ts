import { BaseService } from "./api-base";
<<<<<<< HEAD
<<<<<<< HEAD
import { UserProfile, UserRole } from "@/types";
=======
import { User, UserProfile } from "@/types";
>>>>>>> 93ce3134bddf883293fa3d8aa7e9d3a9e7e7df6c
=======
import { User, UserProfile } from "@/types";
>>>>>>> 6e40384813929841d2d789f0407655ec6f7a29df

export interface LoginCredentials {
  userId: string;
  password: string;
<<<<<<< HEAD
<<<<<<< HEAD
  role?: UserRole;
=======
>>>>>>> 93ce3134bddf883293fa3d8aa7e9d3a9e7e7df6c
=======
>>>>>>> 6e40384813929841d2d789f0407655ec6f7a29df
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
    return BaseService.post<LoginResponse>("/auth/login", {
      email: credentials.userId,
      password: credentials.password,
    });
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
