import { BaseService } from "./api-base";
import {
  Repair,
  RepairFormData,
  RepairWithDetails,
  RepairStatus,
  RepairCategory,
  RepairStats,
} from "@/types";

export const RepairService = {
  getAll: async (params?: {
    status?: RepairStatus;
    category?: RepairCategory;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    return BaseService.get<RepairWithDetails[]>("/repairs", params);
  },

  getById: async (id: string) => {
    return BaseService.get<RepairWithDetails>(`/repairs/${id}`);
  },

  create: async (data: RepairFormData) => {
    return BaseService.post<Repair>("/repairs", data);
  },

  updateStatus: async (id: string, status: RepairStatus) => {
    return BaseService.patch<Repair>(`/repairs/${id}/status`, { status });
  },

  update: async (id: string, data: Partial<RepairFormData>) => {
    return BaseService.put<Repair>(`/repairs/${id}`, data);
  },

  delete: async (id: string) => {
    return BaseService.delete(`/repairs/${id}`);
  },

  getByStudent: async (studentId: string) => {
    return BaseService.get<Repair[]>(`/repairs/student/${studentId}`);
  },

  getByRoom: async (roomId: string) => {
    return BaseService.get<Repair[]>(`/repairs/room/${roomId}`);
  },

  getStats: async () => {
    return BaseService.get<RepairStats>("/repairs/stats");
  },

  getMyRequests: async () => {
    return BaseService.get<RepairWithDetails[]>("/repairs/my-requests");
  },
};
