"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import { ActivityList } from "@/features/activities";
import { ActivityWithParticipants } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";

const mockActivities: ActivityWithParticipants[] = [
  {
    id: "1",
    title: "Community BBQ",
    description: "Join us for a fun BBQ event at the common area. Food and drinks provided!",
    location: "Common Area",
    startTime: new Date(2026, 5, 15, 16, 0),
    endTime: new Date(2026, 5, 15, 20, 0),
    maxParticipants: 50,
    createdBy: 1,
    createdAt: new Date(2026, 5, 1, 10, 0),
    updatedAt: new Date(2026, 5, 1, 10, 0),
    participants: [],
    _count: { participants: 25 },
  },
  {
    id: "2",
    title: "Study Group Session",
    description: "Weekly study group for math and science subjects.",
    location: "Study Room 101",
    startTime: new Date(2026, 5, 10, 18, 0),
    endTime: new Date(2026, 5, 10, 20, 0),
    maxParticipants: 20,
    createdBy: 1,
    createdAt: new Date(2026, 5, 5, 9, 0),
    updatedAt: new Date(2026, 5, 5, 9, 0),
    participants: [],
    _count: { participants: 12 },
  },
  {
    id: "3",
    title: "Fitness Challenge",
    description: "30-day fitness challenge with prizes for top performers.",
    location: "Gym",
    startTime: new Date(2026, 5, 20, 7, 0),
    endTime: new Date(2026, 5, 20, 8, 0),
    maxParticipants: 30,
    createdBy: 1,
    createdAt: new Date(2026, 5, 8, 14, 0),
    updatedAt: new Date(2026, 5, 8, 14, 0),
    participants: [],
    _count: { participants: 18 },
  },
];

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityWithParticipants[]>(mockActivities);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleJoin = (activityId: string) => {
    console.log("Joining activity:", activityId);
  };

  const handleLeave = (activityId: string) => {
    console.log("Leaving activity:", activityId);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Activities</h1>
            <p className="text-muted-foreground mt-1">
              Join campus activities and events
            </p>
          </div>
          {user.role === "manager" && (
            <Button>
              <Plus className="w-5 h-5" />
              Create Activity
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ActivityList
        activities={activities}
        onJoin={handleJoin}
        onLeave={handleLeave}
      />
    </div>
  );
}
