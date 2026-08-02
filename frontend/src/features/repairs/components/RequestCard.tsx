"use client";

import { RepairWithDetails, RepairStatus } from "@/types";
import { Calendar, MapPin, AlertTriangle, User, Clock } from "lucide-react";
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

const statusBadgeClasses: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  completed: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  resolved: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  resolved: "Completed",
  rejected: "Rejected",
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

  const normalizedStatus = request.status === "resolved" ? "completed" : request.status;

  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              {categoryIcons[request.category] || categoryIcons.other}
            </div>
            <div>
              <h3 className="font-semibold capitalize">{request.category}</h3>
              <div className="flex items-center gap-2 text-muted-foreground mt-0.5 text-xs">
                <MapPin className="w-3.5 h-3.5" />
                <span>Room {request.room?.roomNumber || "N/A"}</span>
              </div>
            </div>
          </div>
          <Badge className={`border text-xs px-2.5 py-0.5 ${statusBadgeClasses[request.status] || statusBadgeClasses.pending}`}>
            {statusLabel[request.status] || request.status}
          </Badge>
        </div>

        {/* Student details display */}
        {request.student && (
          <div className="flex items-center gap-2 text-xs bg-muted/50 px-3 py-1.5 rounded-md mb-3 font-medium text-muted-foreground">
            <User className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground">{request.student.name}</span>
            <span>•</span>
            <span className="font-mono text-primary">{request.student.studentId}</span>
          </div>
        )}

        <p className="text-foreground/90 text-sm mb-4">{request.description}</p>

        {request.imageUrl && (
          <img
            src={request.imageUrl}
            alt="Issue"
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
        )}
      </div>

      <div>
        {request.updatedBy && (
          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5 italic bg-accent/20 px-2.5 py-1 rounded">
            <Clock className="w-3 h-3" />
            <span>Updated by {request.updatedBy} at {formatDate(request.updatedAt)}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(request.createdAt)}</span>
            </div>
            <div
              className={`flex items-center gap-1 capitalize font-medium ${priorityColors[request.priority]}`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{request.priority}</span>
            </div>
          </div>

          {isManager ? (
            <Select
              value={normalizedStatus}
              onValueChange={(value) =>
                onStatusChange(request.id, value as RepairStatus)
              }
            >
              <SelectTrigger className="w-32 h-8 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Status: {statusLabel[request.status] || request.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
