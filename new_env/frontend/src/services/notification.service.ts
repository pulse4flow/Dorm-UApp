import { BaseService } from "./api-base";
import { Notification, NotificationFilter, NotificationCounts } from "@/types";

export const NotificationService = {
  getAll: async (params?: NotificationFilter & { page?: number; limit?: number }) => {
    return BaseService.get<Notification[]>("/notifications", params as Record<string, unknown>);
  },

  getById: async (id: string) => {
    return BaseService.get<Notification>(`/notifications/${id}`);
  },

  markAsRead: async (id: string) => {
    return BaseService.patch<Notification>(`/notifications/${id}/read`, {});
  },

  markAllAsRead: async () => {
    return BaseService.patch("/notifications/read-all", {});
  },

  delete: async (id: string) => {
    return BaseService.delete(`/notifications/${id}`);
  },

  deleteAll: async () => {
    return BaseService.delete("/notifications");
  },

  getCounts: async () => {
    return BaseService.get<NotificationCounts>("/notifications/counts");
  },

  getUnreadCount: async () => {
    return BaseService.get<{ count: number }>("/notifications/unread-count");
  },
};
