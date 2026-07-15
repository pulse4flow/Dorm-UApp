import { BaseService } from "./api-base";
import { Announcement, AnnouncementFormData, AnnouncementWithAuthor } from "@/types";

export const AnnouncementService = {
  getAll: async (params?: { type?: string; page?: number; limit?: number }) => {
    return BaseService.get<AnnouncementWithAuthor[]>("/announcements", params);
  },

  getById: async (id: string) => {
    return BaseService.get<AnnouncementWithAuthor>(`/announcements/${id}`);
  },

  create: async (data: AnnouncementFormData) => {
    return BaseService.post<Announcement>("/announcements", data);
  },

  update: async (id: string, data: Partial<AnnouncementFormData>) => {
    return BaseService.put<Announcement>(`/announcements/${id}`, data);
  },

  delete: async (id: string) => {
    return BaseService.delete(`/announcements/${id}`);
  },

  getLatest: async (limit?: number) => {
    return BaseService.get<AnnouncementWithAuthor[]>("/announcements/latest", { limit: limit || 5 });
  },

  markAsRead: async (id: string) => {
    return BaseService.post(`/announcements/${id}/read`, {});
  },
};
