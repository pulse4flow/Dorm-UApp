"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { ScoreDisplay, ScoreAdjustForm } from "@/features/score";
import { DormitoryScore, ScoreHistory, ScoreAdjustment } from "@/types";
import { BaseService } from "@/services/api-base";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function ScorePage() {
  const { user, isManager } = useAuth();
  const queryClient = useQueryClient();
  const [showAdjustForm, setShowAdjustForm] = useState(false);

  const { data: score, isLoading: loadingScore } = useQuery({
    queryKey: ["myScore", user?.id],
    queryFn: () => BaseService.get<DormitoryScore>("/score/my-score"),
    enabled: !!user,
    staleTime: 30000,
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["myScoreHistory", user?.id],
    queryFn: () => BaseService.get<ScoreHistory[]>("/score/my-history"),
    enabled: !!user,
    staleTime: 30000,
  });

  const adjustScoreMutation = useMutation({
    mutationFn: (data: ScoreAdjustment) => BaseService.post<ScoreHistory>("/score/adjust", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myScore", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["myScoreHistory", user?.id] });
      setShowAdjustForm(false);
    },
  });

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
    adjustScoreMutation.mutate(data);
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
        {score && (
          <ScoreDisplay
            score={score}
            showDetails={true}
          />
        )}
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
          currentScore={score?.score || 100}
          onSubmit={handleAdjustScore}
          onClose={() => setShowAdjustForm(false)}
        />
      )}
    </div>
  );
}
