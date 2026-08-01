"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreHistory } from "@/types";

interface ScoreHistoryProps {
  logs: ScoreHistory[];
  isManager: boolean;
  onViewAll?: () => void;
}

export function ScoreHistoryList({ logs, isManager, onViewAll }: ScoreHistoryProps) {
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

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-12 h-12 text-muted-foreground mx-auto mb-3"
          >
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
          <p className="text-muted-foreground">No score changes yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Score History</h3>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All ({logs.length})
          </Button>
        )}
      </div>
      {logs.slice(0, 3).map((log) => (
        <Card key={log.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    log.newScore >= log.previousScore
                      ? "bg-green-500/10"
                      : "bg-destructive/10"
                  }`}
                >
                  {log.newScore >= log.previousScore ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {isManager ? log.studentName : "Score Changed"}
                    </span>
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
                  <p className="text-xs text-muted-foreground mt-0.5">{log.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{log.previousScore}</span>
                  <span>→</span>
                  <span className={`font-medium ${getScoreColor(log.newScore)}`}>
                    {log.newScore}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(log.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
