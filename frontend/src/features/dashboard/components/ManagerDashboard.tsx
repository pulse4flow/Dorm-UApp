"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Users,
  Building2,
  Wrench,
  Shield,
  User,
  ArrowRight,
  Award,
  Bell,
} from "lucide-react";
import { UserService } from "@/services/user.service";
import { BaseService } from "@/services/api-base";
import { UserProfile } from "@/types";
import { RepairWithDetails, RepairStats } from "@/types/repair.types";

interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
}

interface StatCard {
  label: string;
  value: number;
  icon: typeof Users;
  iconClass: string;
  sub?: string;
}

function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card border border-border rounded-xl p-5 flex items-start justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
            {card.sub && <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>}
          </div>
          <div
            className={`flex items-center justify-center w-11 h-11 rounded-lg ${card.iconClass}`}
          >
            <card.icon className="w-5 h-5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
        config[status] || "bg-secondary text-secondary-foreground border-border"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function ManagerDashboard() {
  const { data: users = [] } = useQuery<UserProfile[]>({
    queryKey: ["users"],
    queryFn: () => UserService.getAll(),
    staleTime: 30000,
  });

  const { data: roomStats } = useQuery<RoomStats>({
    queryKey: ["roomStats"],
    queryFn: () => BaseService.get<RoomStats>("/rooms/stats"),
    staleTime: 30000,
  });

  const { data: repairStats } = useQuery<RepairStats>({
    queryKey: ["repairStats"],
    queryFn: () => BaseService.get<RepairStats>("/repairs/stats"),
    staleTime: 30000,
  });

  const { data: recentRepairs } = useQuery<{ data: RepairWithDetails[] }>({
    queryKey: ["recentRepairs"],
    queryFn: () => BaseService.get<{ data: RepairWithDetails[] }>("/repairs?limit=5"),
    staleTime: 30000,
  });

  const students = users.filter((u) => u.role === "student");
  const managers = users.filter((u) => u.role === "manager");
  const recentUsers = [...users].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5);

  const statsCards: StatCard[] = [
    {
      label: "Students",
      value: students.length,
      icon: User,
      iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      sub: `Max ${3} students`,
    },
    {
      label: "Managers",
      value: managers.length,
      icon: Shield,
      iconClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      sub: `Max ${2} managers`,
    },
    {
      label: "Rooms",
      value: roomStats?.total ?? 0,
      icon: Building2,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sub: roomStats
        ? `${roomStats.occupied} occupied · ${roomStats.available} free · ${roomStats.maintenance} maint.`
        : "Loading...",
    },
    {
      label: "Repair Requests",
      value: repairStats?.total ?? 0,
      icon: Wrench,
      iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      sub: repairStats
        ? `${repairStats.pending} pending · ${repairStats.completed} done`
        : "Loading...",
    },
  ];

  return (
    <div>
      <StatCards cards={statsCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Users</h3>
            <Link
              href="/users"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Manage users <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            ) : (
              recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                        u.role === "manager"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {u.role === "manager" ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {u.name} <span className="text-muted-foreground">({u.username})</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u.role === "manager" ? "Manager" : `${u.studentId || "Student"} · Room ${u.roomNumber || u.roomId || "—"}`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border shrink-0 ${
                      u.role === "manager"
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                        : "bg-secondary text-secondary-foreground border-border"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Repair Requests</h3>
            <Link
              href="/repairs"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              All repairs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {(recentRepairs?.data || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No repair requests yet.</p>
            ) : (
              (recentRepairs?.data || []).slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 p-3 bg-muted/40 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.room?.roomNumber || r.roomId} · {r.student?.name || "Unknown"} ·{" "}
                        {r.category}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/users"
          className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
          <p className="text-sm font-semibold">User Management</p>
          <p className="text-xs text-muted-foreground mt-1">Create & manage accounts</p>
        </Link>
        <Link
          href="/repairs"
          className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
          <p className="text-sm font-semibold">Maintenance</p>
          <p className="text-xs text-muted-foreground mt-1">Manage repair requests</p>
        </Link>
        <Link
          href="/score"
          className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
          <p className="text-sm font-semibold">Scores</p>
          <p className="text-xs text-muted-foreground mt-1">View score history</p>
        </Link>
        <Link
          href="/notifications"
          className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground mt-1">View alerts & updates</p>
        </Link>
      </div>
    </div>
  );
}
