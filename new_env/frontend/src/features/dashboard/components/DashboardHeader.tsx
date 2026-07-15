"use client";

import { Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  user: {
    name: string;
    role: "manager" | "student";
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const isManager = user.role === "manager";

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your dormitory overview
          </p>
        </div>
        <Badge variant={isManager ? "default" : "secondary"} className="text-sm">
          {isManager ? (
            <Shield className="w-3 h-3 mr-1" />
          ) : (
            <User className="w-3 h-3 mr-1" />
          )}
          {isManager ? "Manager" : "Student"}
        </Badge>
      </div>
    </div>
  );
}
