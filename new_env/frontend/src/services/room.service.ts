import { BaseService } from "./api-base";
import { Room, RoomStatus, RoomWithStudents } from "@/types";

export interface RoomFormData {
  roomNumber: string;
  building: string;
  floor: number;
  capacity: number;
}

export const RoomService = {
  getAll: async (params?: { building?: string; floor?: number; status?: RoomStatus }) => {
    return BaseService.get<Room[]>("/rooms", params);
  },

  getById: async (id: string) => {
    return BaseService.get<RoomWithStudents>(`/rooms/${id}`);
  },

  getByNumber: async (roomNumber: string) => {
    return BaseService.get<Room>(`/rooms/number/${roomNumber}`);
  },

  create: async (data: RoomFormData) => {
    return BaseService.post<Room>("/rooms", data);
  },

  update: async (id: string, data: Partial<RoomFormData>) => {
    return BaseService.put<Room>(`/rooms/${id}`, data);
  },

  updateStatus: async (id: string, status: RoomStatus) => {
    return BaseService.patch<Room>(`/rooms/${id}/status`, { status });
  },

  delete: async (id: string) => {
    return BaseService.delete(`/rooms/${id}`);
  },

  getAvailable: async () => {
    return BaseService.get<Room[]>("/rooms/available");
  },

  getStats: async () => {
    return BaseService.get<{
      total: number;
      available: number;
      occupied: number;
      maintenance: number;
    }>("/rooms/stats");
  },
};
