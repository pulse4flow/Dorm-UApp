import { BaseService } from "./api-base";
import { Activity, ActivityFormData, ActivityWithParticipants, ActivityFilter } from "@/types";

export const ActivityService = {
  getAll: async (params?: ActivityFilter & { page?: number; limit?: number }) => {
    return BaseService.get<ActivityWithParticipants[]>("/activities", params as Record<string, unknown>);
  },

  getById: async (id: string) => {
    return BaseService.get<ActivityWithParticipants>(`/activities/${id}`);
  },

  create: async (data: ActivityFormData) => {
    return BaseService.post<Activity>("/activities", data);
  },

  update: async (id: string, data: Partial<ActivityFormData>) => {
    return BaseService.put<Activity>(`/activities/${id}`, data);
  },

  delete: async (id: string) => {
    return BaseService.delete(`/activities/${id}`);
  },

  join: async (activityId: string) => {
    return BaseService.post(`/activities/${activityId}/join`, {});
  },

  leave: async (activityId: string) => {
    return BaseService.delete(`/activities/${activityId}/leave`);
  },

  getMyActivities: async () => {
    return BaseService.get<ActivityWithParticipants[]>("/activities/my-activities");
  },

  getUpcoming: async (limit?: number) => {
    return BaseService.get<ActivityWithParticipants[]>("/activities/upcoming", { limit: limit || 5 });
  },

  getParticipants: async (activityId: string) => {
    return BaseService.get<ActivityWithParticipants["participants"]>(`/activities/${activityId}/participants`);
  },
};
