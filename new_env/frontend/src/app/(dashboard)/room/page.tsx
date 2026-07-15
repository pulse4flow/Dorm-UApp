"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import { RoomInfo } from "@/features/room";
import { Room } from "@/types";

export default function RoomPage() {
  const { user } = useAuth();

  const mockRoom: Room = {
    id: "room-1",
    roomNumber: user?.room || "A-204",
    building: "Building A",
    floor: 2,
    capacity: 2,
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

      <RoomInfo room={mockRoom} />
    </div>
  );
}
