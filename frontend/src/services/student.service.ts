import { BaseService } from "./api-base";
import { Student, StudentFormData } from "@/types";

export const StudentService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    return BaseService.get<Student[]>("/students", params);
  },

  getById: async (id: string) => {
    return BaseService.get<Student>(`/students/${id}`);
  },

  getByStudentId: async (studentId: string) => {
    return BaseService.get<Student>(`/students/student-id/${studentId}`);
  },

  create: async (data: StudentFormData) => {
    return BaseService.post<Student>("/students", data);
  },

  update: async (id: string, data: Partial<StudentFormData>) => {
    return BaseService.put<Student>(`/students/${id}`, data);
  },

  delete: async (id: string) => {
    return BaseService.delete(`/students/${id}`);
  },

  getByRoom: async (roomId: string) => {
    return BaseService.get<Student[]>(`/students/room/${roomId}`);
  },
};
