"use client";

import { Room } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Wifi, Thermometer } from "lucide-react";

interface RoomInfoProps {
  room: Room;
}

export function RoomInfo({ room }: RoomInfoProps) {
  const statusColors: Record<string, string> = {
    available: "bg-green-500/10 text-green-600",
    occupied: "bg-blue-500/10 text-blue-600",
    maintenance: "bg-yellow-500/10 text-yellow-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Room {room.roomNumber}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColors[room.status]}>
                {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{room.building}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <Building2 className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{room.floor}</p>
            <p className="text-sm text-muted-foreground">Floor</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{room.capacity}</p>
            <p className="text-sm text-muted-foreground">Capacity</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <Wifi className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">Yes</p>
            <p className="text-sm text-muted-foreground">WiFi</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <Thermometer className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">AC</p>
            <p className="text-sm text-muted-foreground">Cooling</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
