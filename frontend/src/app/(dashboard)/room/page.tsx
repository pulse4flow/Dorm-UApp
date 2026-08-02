"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { RoomInfo } from "@/features/room";
import { Room } from "@/types";
import { BaseService } from "@/services/api-base";

export default function RoomPage() {
  const { user } = useAuth();

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", user?.room],
    queryFn: () => BaseService.get<Room>("/rooms/number/" + (user?.room || "A-201")),
    enabled: !!user,
    staleTime: 30000,
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Room</h1>
        <p className="text-muted-foreground mt-1">View your room information and amenities</p>
      </div>

      {room && <RoomInfo room={room} />}
    </div>
  );
}
