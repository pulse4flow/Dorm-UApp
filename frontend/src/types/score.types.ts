export interface DormitoryScore {
  id: string;
  studentId: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoreHistory {
  id: string;
  studentId: string;
  studentName: string;
  previousScore: number;
  newScore: number;
  reason: string;
  changedBy: string;
  createdAt: Date;
}

export interface ScoreAdjustment {
  studentId: string;
  score: number;
  reason: string;
}

export interface ScoreStats {
  average: number;
  highest: number;
  lowest: number;
  total: number;
}

export type ScoreRating = "Excellent" | "Good" | "Fair" | "Needs Improvement" | "Poor";
