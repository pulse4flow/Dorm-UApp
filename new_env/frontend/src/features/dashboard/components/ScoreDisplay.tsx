"use client";

import { Award, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types";

interface ScoreDisplayProps {
  user: UserProfile;
  onAdjustClick?: () => void;
}

export function ScoreDisplay({ user, onAdjustClick }: ScoreDisplayProps) {
  const score = user.dormScore ?? 0;
  const isManager = user.role === "manager";

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Dorm Score</h3>
            <p className="text-sm text-muted-foreground">Your current rating</p>
          </div>
        </div>
        {isManager && onAdjustClick && (
          <Button variant="outline" size="sm" onClick={onAdjustClick}>
            Adjust Score
          </Button>
        )}
      </div>
      <div className="text-center py-4">
        <div className={`text-5xl mb-2 font-bold ${getScoreColor(score)}`}>
          {score}
        </div>
        <div className="text-lg mb-3">{getScoreRating(score)}</div>
        <div className="w-full bg-muted rounded-full h-2.5 mb-4">
          <div
            className="bg-primary h-2.5 rounded-full transition-all"
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Score is based on cleanliness inspections, rule compliance, and community participation
        </p>
      </div>
    </div>
  );
}
