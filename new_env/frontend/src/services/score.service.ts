import { BaseService } from "./api-base";
import { DormitoryScore, ScoreHistory, ScoreAdjustment, ScoreStats } from "@/types";

export const ScoreService = {
  getMyScore: async () => {
    return BaseService.get<DormitoryScore>("/score/my-score");
  },

  getStudentScore: async (studentId: string) => {
    return BaseService.get<DormitoryScore>(`/score/student/${studentId}`);
  },

  getScoreHistory: async (params?: { studentId?: string; page?: number; limit?: number }) => {
    return BaseService.get<ScoreHistory[]>("/score/history", params);
  },

  adjustScore: async (data: ScoreAdjustment) => {
    return BaseService.post<ScoreHistory>("/score/adjust", data);
  },

  getMyHistory: async () => {
    return BaseService.get<ScoreHistory[]>("/score/my-history");
  },

  getStats: async () => {
    return BaseService.get<ScoreStats>("/score/stats");
  },

  getAllScores: async (params?: { page?: number; limit?: number; sortBy?: string }) => {
    return BaseService.get<DormitoryScore[]>("/score/all", params);
  },

  getScoreHistoryByStudent: async (studentId: string) => {
    return BaseService.get<ScoreHistory[]>(`/score/history/${studentId}`);
  },
};
