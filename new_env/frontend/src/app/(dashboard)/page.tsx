"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import {
  DashboardHeader,
  ProfileCard,
  ScoreDisplay,
  QuickActions,
  ScoreHistoryList,
} from "@/features/dashboard";
import { ScoreHistory } from "@/types";

const mockScoreLogs: ScoreHistory[] = [
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
];

export default function DashboardPage() {
  const { user, isManager } = useAuth();
  const [scoreLogs, setScoreLogs] = useState<ScoreHistory[]>(mockScoreLogs);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <DashboardHeader user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ProfileCard user={user} />
        <ScoreDisplay user={user} />
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Maintenance Requests</span>
              <span className="text-lg font-semibold">3</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Documents</span>
              <span className="text-lg font-semibold">12</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Days Remaining</span>
              <span className="text-lg font-semibold">248</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <ScoreHistoryList
          logs={scoreLogs}
          isManager={isManager}
          onViewAll={() => {}}
        />
      </div>

      <QuickActions isManager={isManager} />
    </div>
  );
}
