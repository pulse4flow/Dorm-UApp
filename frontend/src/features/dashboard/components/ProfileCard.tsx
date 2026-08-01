"use client";

import { Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/types";

interface ProfileCardProps {
  user: UserProfile;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const isManager = user.role === "manager";

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
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
            className="w-6 h-6 text-primary"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Profile Details</h3>
          <p className="text-sm text-muted-foreground">Your information</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-muted-foreground">
            {isManager ? "Manager ID" : "Student ID"}
          </span>
          <span className="font-medium">{user.id}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-muted-foreground">Name</span>
          <span className="font-medium">{user.name}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-muted-foreground">Room Number</span>
          <span className="font-medium">{user.room}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-muted-foreground">Building</span>
          <span className="font-medium">Building A</span>
        </div>
      </div>
    </div>
  );
}
