"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import { ScoreDisplay, ScoreAdjustForm } from "@/features/score";
import { DormitoryScore, ScoreHistory, ScoreAdjustment } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

const mockScore: DormitoryScore = {
  id: "score-1",
  studentId: "STU-042",
  score: 85,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockHistory: ScoreHistory[] = [
  {
    id: "log1",
    studentId: "STU-042",
    studentName: "John Doe",
    previousScore: 90,
    newScore: 85,
    reason: "Late noise complaint violation on May 15th",
    changedBy: "Admin Manager",
    createdAt: new Date(2026, 4, 16, 10, 0),
  },
  {
    id: "log2",
    studentId: "STU-042",
    studentName: "John Doe",
    previousScore: 85,
    newScore: 82,
    reason: "Missed room inspection appointment",
    changedBy: "Admin Manager",
    createdAt: new Date(2026, 4, 20, 14, 30),
  },
  {
    id: "log3",
    studentId: "STU-042",
    studentName: "John Doe",
    previousScore: 82,
    newScore: 85,
    reason: "Excellent participation in community event",
    changedBy: "Admin Manager",
    createdAt: new Date(2026, 4, 25, 9, 0),
  },
];

export default function ScorePage() {
  const { user, isManager } = useAuth();
  const [score, setScore] = useState<DormitoryScore>(mockScore);
  const [history, setHistory] = useState<ScoreHistory[]>(mockHistory);
  const [showAdjustForm, setShowAdjustForm] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-destructive";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const handleAdjustScore = (data: ScoreAdjustment) => {
    const newScore = {
      ...score,
      score: data.score,
      updatedAt: new Date(),
    };
    setScore(newScore);

    const newLog: ScoreHistory = {
      id: Date.now().toString(),
      studentId: data.studentId,
      studentName: user?.name || "Student",
      previousScore: score.score,
      newScore: data.score,
      reason: data.reason,
      changedBy: user?.name || "Manager",
      createdAt: new Date(),
    };
    setHistory([newLog, ...history]);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dormitory Score</h1>
        <p className="text-muted-foreground mt-1">
          {isManager ? "Manage student dormitory scores" : "View your dormitory score history"}
        </p>
      </div>

      <div className="mb-8">
        <ScoreDisplay
          score={score}
          showDetails={true}
        />
        {isManager && (
          <div className="mt-4">
            <Button onClick={() => setShowAdjustForm(true)}>
              Adjust Score
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Score History</h2>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No score changes yet</p>
          ) : (
            <div className="space-y-3">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isManager && (
                        <span className="font-medium text-sm">{log.studentName}</span>
                      )}
                      <Badge
                        variant="outline"
                        className={
                          log.newScore >= log.previousScore
                            ? "text-green-600"
                            : "text-destructive"
                        }
                      >
                        {log.newScore >= log.previousScore ? "+" : ""}
                        {log.newScore - log.previousScore}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="text-muted-foreground">{log.previousScore}</span>
                    <span>→</span>
                    <span className={`font-medium ${getScoreColor(log.newScore)}`}>
                      {log.newScore}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{log.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">By: {log.changedBy}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showAdjustForm && (
        <ScoreAdjustForm
          studentId={String(user.id)}
          studentName={user.name}
          currentScore={score.score}
          onSubmit={handleAdjustScore}
          onClose={() => setShowAdjustForm(false)}
        />
      )}
    </div>
  );
}
