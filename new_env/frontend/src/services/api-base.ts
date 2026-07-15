import { api } from "@/lib/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const BaseService = {
  get: async <T>(endpoint: string, params?: Record<string, unknown>) => {
    const serializedParams: Record<string, string | number | boolean> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          serializedParams[key] = value as string | number | boolean;
        }
      });
    }
    return api.get<T>(endpoint, { params: Object.keys(serializedParams).length > 0 ? serializedParams : undefined });
  },

  post: async <T>(endpoint: string, body: unknown) => {
    return api.post<T>(endpoint, body);
  },

  put: async <T>(endpoint: string, body: unknown) => {
    return api.put<T>(endpoint, body);
  },

  patch: async <T>(endpoint: string, body: unknown) => {
    return api.put<T>(endpoint, body);
  },

  delete: async <T>(endpoint: string) => {
    return api.delete<T>(endpoint);
  },
};
