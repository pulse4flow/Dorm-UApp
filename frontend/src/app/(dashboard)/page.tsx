"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import {
  DashboardHeader,
  ProfileCard,
  ScoreDisplay,
  QuickActions,
  ScoreHistoryList,
  ManagerDashboard,
} from "@/features/dashboard";
import { ScoreHistory, RepairStats, NotificationCounts } from "@/types";
import { BaseService } from "@/services/api-base";

export default function DashboardPage() {
  const { user, isManager } = useAuth();

  const { data: myScoreData } = useQuery({
    queryKey: ["myScore", user?.id],
    queryFn: () => BaseService.get<{ score: number }>("/score/my-score"),
    enabled: !!user && !isManager,
    staleTime: 0,
  });

  const { data: scoreLogs = [] } = useQuery({
    queryKey: ["scoreHistory", user?.id],
    queryFn: () => BaseService.get<ScoreHistory[]>("/score/my-history"),
    enabled: !!user && !isManager,
    staleTime: 0,
  });

  const { data: stats = { total: 0, pending: 0, inProgress: 0, resolved: 0 }, isLoading: loadingStats } = useQuery({
    queryKey: ["repairStats"],
    queryFn: () => BaseService.get<RepairStats>("/repairs/stats"),
    enabled: !!user && !isManager,
    staleTime: 30000,
  });

  const { data: counts = { total: 0, unread: 0, byType: { repair: 0, score: 0, system: 0 } }, isLoading: loadingCounts } = useQuery({
    queryKey: ["notificationCounts", user?.id],
    queryFn: () => BaseService.get<NotificationCounts>("/notifications/counts"),
    enabled: !!user && !isManager,
    staleTime: 30000,
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (isManager) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardHeader user={user} />
        <ManagerDashboard />
      </div>
    );
  }

  const displayUser = myScoreData?.score !== undefined ? { ...user, dormScore: myScoreData.score } : user;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <DashboardHeader user={displayUser} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ProfileCard user={displayUser} />
        <ScoreDisplay user={displayUser} />
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Maintenance Requests</span>
              <span className="text-lg font-semibold">{loadingStats ? "..." : stats.total}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Pending</span>
              <span className="text-lg font-semibold">{loadingStats ? "..." : stats.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Notifications</span>
              <span className="text-lg font-semibold">{loadingCounts ? "..." : counts.unread}</span>
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
