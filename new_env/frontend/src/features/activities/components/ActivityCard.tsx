"use client";

import { ActivityWithParticipants } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";

interface ActivityCardProps {
  activity: ActivityWithParticipants;
  isRegistered?: boolean;
  onJoin?: (activityId: string) => void;
  onLeave?: (activityId: string) => void;
}

export function ActivityCard({
  activity,
  isRegistered,
  onJoin,
  onLeave,
}: ActivityCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getEventStatus = () => {
    const now = new Date();
    const start = new Date(activity.startTime);
    const end = new Date(activity.endTime);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "completed";
  };

  const status = getEventStatus();
  const statusColors = {
    upcoming: "bg-blue-500/10 text-blue-600",
    ongoing: "bg-green-500/10 text-green-600",
    completed: "bg-muted text-muted-foreground",
  };

  const participantCount = activity._count?.participants ?? activity.participants?.length ?? 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold">{activity.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
          </div>
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(activity.startTime)} - {formatTime(activity.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{activity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {participantCount}
              {activity.maxParticipants && ` / ${activity.maxParticipants}`} participants
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {isRegistered ? (
            <Button
              variant="outline"
              onClick={() => onLeave?.(activity.id)}
              disabled={status === "completed"}
            >
              Leave Activity
            </Button>
          ) : (
            <Button
              onClick={() => onJoin?.(activity.id)}
              disabled={
                status === "completed" ||
                (activity.maxParticipants !== null &&
                  participantCount >= activity.maxParticipants)
              }
            >
              Join Activity
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
