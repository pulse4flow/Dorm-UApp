"use client";

import { UserProfile } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, User, Mail, Building2, Calendar } from "lucide-react";

interface ProfileCardProps {
  user: UserProfile;
  onEdit?: () => void;
}

export function ProfileCard({ user, onEdit }: ProfileCardProps) {
  const isManager = user.role === "manager";

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              {isManager ? (
                <Shield className="w-10 h-10 text-primary" />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isManager ? "default" : "secondary"}>
                  {isManager ? "Manager" : "Student"}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{user.room}</span>
              </div>
            </div>
          </div>
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-medium">{user.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">{user.room}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dormitory Info</h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {user.dormScore ?? "N/A"}
                </div>
                <p className="text-sm text-muted-foreground">Dorm Score</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
