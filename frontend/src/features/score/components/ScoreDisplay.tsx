"use client";

import { DormitoryScore } from "@/types";
import { Award, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreDisplayProps {
  score: DormitoryScore;
  showDetails?: boolean;
}

export function ScoreDisplay({ score, showDetails = true }: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-destructive";
  };

  const getScoreRating = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    if (score >= 60) return "Needs Improvement";
    return "Poor";
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full">
          <Award className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Dormitory Score</h3>
          <p className="text-sm text-muted-foreground">Your current rating</p>
        </div>
      </div>
      <div className="text-center py-4">
        <div className={`text-6xl mb-2 font-bold ${getScoreColor(score.score)}`}>
          {score.score}
        </div>
        <div className="text-xl mb-3">{getScoreRating(score.score)}</div>
        <div className="w-full bg-muted rounded-full h-3 mb-4">
          <div
            className="bg-primary h-3 rounded-full transition-all"
            style={{ width: `${score.score}%` }}
          />
        </div>
        {showDetails && (
          <p className="text-sm text-muted-foreground">
            Score is based on cleanliness inspections, rule compliance, and community participation
          </p>
        )}
      </div>
    </div>
  );
}
