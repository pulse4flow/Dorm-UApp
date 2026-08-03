"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { ScoreDisplay, ScoreAdjustForm } from "@/features/score";
import { DormitoryScore, ScoreHistory, ScoreAdjustment, StudentWithUser } from "@/types";
import { BaseService, PaginatedResponse } from "@/services/api-base";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ScorePage() {
  const { user, isManager } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [showAdjustForm, setShowAdjustForm] = useState(false);

  // Fetch list of students for manager student selector
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => BaseService.get<PaginatedResponse<StudentWithUser>>("/students?limit=200"),
    select: (data) => data?.data || [],
    enabled: !!user && isManager,
  });

  // Selected student object for manager view
  const selectedStudent = students.find(
    (s) => s.id === selectedStudentId || s.studentId === selectedStudentId
  ) || students[0];

  const targetStudentId = isManager ? selectedStudent?.id : undefined;

  // Manager: live current score for selected student (single source of truth)
  const { data: managerStudentScore } = useQuery({
    queryKey: ["studentScore", targetStudentId],
    queryFn: () => BaseService.get<DormitoryScore>(`/score/student/${targetStudentId}`),
    enabled: !!user && isManager && !!targetStudentId,
    staleTime: 0,
  });

  // Student own score (students only)
  const { data: myScore } = useQuery({
    queryKey: ["myScore", user?.id],
    queryFn: () => BaseService.get<DormitoryScore>("/score/my-score"),
    enabled: !!user && !isManager,
    staleTime: 0,
  });

  // Student own score history (students only)
  const { data: myHistory = [] } = useQuery({
    queryKey: ["myScoreHistory", user?.id],
    queryFn: () => BaseService.get<ScoreHistory[]>("/score/my-history"),
    enabled: !!user && !isManager,
    staleTime: 0,
  });

  // Manager score history for selected student
  const { data: managerStudentHistory = [] } = useQuery({
    queryKey: ["scoreHistoryByStudent", targetStudentId],
    queryFn: () => BaseService.get<ScoreHistory[]>(`/score/history/${targetStudentId}`),
    enabled: !!user && isManager && !!targetStudentId,
    staleTime: 0,
  });

  const adjustScoreMutation = useMutation({
    mutationFn: (data: ScoreAdjustment) => BaseService.post<ScoreHistory>("/score/adjust", data),
    onSuccess: () => {
      // Invalidate ALL score-related caches so every component refetches from DB
      queryClient.invalidateQueries({ queryKey: ["myScore"] });
      queryClient.invalidateQueries({ queryKey: ["myScoreHistory"] });
      queryClient.invalidateQueries({ queryKey: ["scoreHistoryByStudent"] });
      queryClient.invalidateQueries({ queryKey: ["studentScore"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["scoreHistory"] });
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

  // Single source of truth: always use the dedicated score API, never the student list cache
  const currentScore: DormitoryScore | null = isManager
    ? managerStudentScore || null
    : myScore || null;

  // Use live score value as baseline for the adjust form
  const liveCurrentScore = isManager
    ? (managerStudentScore?.score ?? selectedStudent?.dormScore ?? 100)
    : (myScore?.score ?? user?.dormScore ?? 100);

  const historyLogs: ScoreHistory[] = isManager ? managerStudentHistory : myHistory;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dormitory Score</h1>
        <p className="text-muted-foreground mt-1">
          {isManager
            ? "View and adjust student dormitory scores"
            : "View your dormitory score and rating history"}
        </p>
      </div>

      {isManager && students.length > 0 && (
        <div className="mb-6 p-4 bg-muted/40 border border-border rounded-xl space-y-2">
          <Label className="font-semibold text-sm">Select Student to Manage Score:</Label>
          <Select
            value={selectedStudent?.id || ""}
            onValueChange={(val) => setSelectedStudentId(val)}
          >
            <SelectTrigger className="w-full sm:w-80 bg-background">
              <SelectValue placeholder="Select a student..." />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.studentId} - {s.name} ({s.room?.roomNumber || s.roomId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mb-8">
        {currentScore ? (
          <ScoreDisplay score={currentScore} showDetails={true} />
        ) : (
          <div className="p-6 bg-card border rounded-xl text-center text-muted-foreground">
            No score record available
          </div>
        )}

        {isManager && selectedStudent && (
          <div className="mt-4">
            <Button onClick={() => setShowAdjustForm(true)}>
              Adjust {selectedStudent.name}&apos;s Score
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Score History {isManager && selectedStudent ? `for ${selectedStudent.name}` : ""}
          </h2>
          {historyLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No score changes logged yet</p>
          ) : (
            <div className="space-y-3">
              {historyLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{log.studentName}</span>
                      <Badge
                        variant="outline"
                        className={
                          log.newScore >= log.previousScore
                            ? "text-green-600 border-green-500/30 bg-green-500/10"
                            : "text-destructive border-destructive/30 bg-destructive/10"
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
                  <p className="text-xs text-foreground/80 mt-1">
                    <span className="font-medium text-muted-foreground">Reason:</span> {log.reason}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Changed by: <span className="font-medium">{log.changedBy}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showAdjustForm && selectedStudent && (
        <ScoreAdjustForm
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          currentScore={liveCurrentScore}
          onSubmit={handleAdjustScore}
          onClose={() => setShowAdjustForm(false)}
        />
      )}
    </div>
  );
}
