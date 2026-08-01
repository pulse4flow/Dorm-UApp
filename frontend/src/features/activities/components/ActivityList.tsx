"use client";

import { ActivityWithParticipants } from "@/types";
import { ActivityCard } from "./ActivityCard";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface ActivityListProps {
  activities: ActivityWithParticipants[];
  myActivityIds?: string[];
  onJoin?: (activityId: string) => void;
  onLeave?: (activityId: string) => void;
}

export function ActivityList({
  activities,
  myActivityIds = [],
  onJoin,
  onLeave,
}: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">No activities available</h3>
          <p className="text-muted-foreground">
            Check back later for upcoming events and activities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          isRegistered={myActivityIds.includes(activity.id)}
          onJoin={onJoin}
          onLeave={onLeave}
        />
      ))}
    </div>
  );
}
