"use client";

import { RepairWithDetails, RepairStatus, RepairPriority, RepairCategory } from "@/types";
import { Calendar, MapPin, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequestCardProps {
  request: RepairWithDetails;
  onStatusChange: (id: string, status: RepairStatus) => void;
  isManager: boolean;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  pending: "secondary",
  "in-progress": "default",
  resolved: "outline",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  resolved: "Resolved",
};

const priorityColors: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-yellow-600 dark:text-yellow-500",
  high: "text-orange-600 dark:text-orange-500",
  urgent: "text-destructive",
};

const categoryIcons: Record<string, string> = {
  plumbing: "🚿",
  electrical: "⚡",
  furniture: "🪑",
  hvac: "❄️",
  cleaning: "🧹",
  security: "🔒",
  other: "📝",
};

export function RequestCard({ request, onStatusChange, isManager }: RequestCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">
            {categoryIcons[request.category] || categoryIcons.other}
          </div>
          <div>
            <h3 className="font-semibold capitalize">{request.category}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Room {request.room.roomNumber}</span>
            </div>
          </div>
        </div>
        <Badge variant={statusVariant[request.status]}>
          {statusLabel[request.status]}
        </Badge>
      </div>

      <p className="text-foreground/90 mb-4">{request.description}</p>

      {request.imageUrl && (
        <img
          src={request.imageUrl}
          alt="Issue"
          className="w-full h-40 object-cover rounded-lg mb-4"
        />
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(request.createdAt)}</span>
          </div>
          <div
            className={`flex items-center gap-1.5 capitalize ${priorityColors[request.priority]}`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{request.priority} priority</span>
          </div>
        </div>

        {isManager ? (
          <Select
            value={request.status}
            onValueChange={(value) =>
              onStatusChange(request.id, value as RepairStatus)
            }
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          request.status !== "resolved" && (
            <span className="text-xs text-muted-foreground italic">
              Awaiting manager action
            </span>
          )
        )}
      </div>
    </div>
  );
}
