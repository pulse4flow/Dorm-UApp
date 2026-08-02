"use client";

import { Wrench, Award, Users, Bell } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  isManager: boolean;
}

interface QuickAction {
  href: string;
  label: string;
  description: string;
  icon: typeof Wrench;
  color: string;
  iconColor: string;
  managerOnly?: boolean;
}

export function QuickActions({ isManager }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      href: "/repairs",
      label: "Maintenance",
      description: "Submit and track requests",
      icon: Wrench,
      color: "bg-primary/10 group-hover:bg-primary/20",
      iconColor: "text-primary",
    },
    {
      href: "/score",
      label: "Dorm Score",
      description: "View your score history",
      icon: Award,
      color: "bg-green-500/10 group-hover:bg-green-500/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      href: "/notifications",
      label: "Notifications",
      description: "Check your alerts",
      icon: Bell,
      color: "bg-purple-500/10 group-hover:bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      href: "/students",
      label: "Students",
      description: "Manage dorm residents",
      icon: Users,
      color: "bg-blue-500/10 group-hover:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      managerOnly: true,
    },
  ];

  const visibleActions = actions.filter((action) => !action.managerOnly || isManager);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${action.color}`}
              >
                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <div>
                <h3 className="mb-1">{action.label}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
