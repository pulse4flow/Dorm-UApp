"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { NotificationList } from "@/features/notifications";
import { Notification, NotificationCounts } from "@/types";
import { BaseService, PaginatedResponse } from "@/services/api-base";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Wrench, Award } from "lucide-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => BaseService.get<PaginatedResponse<Notification>>("/notifications"),
    select: (data) => data?.data || [],
    enabled: !!user,
    staleTime: 30000,
  });

  const { data: counts = { total: 0, unread: 0, byType: { repair: 0, score: 0, system: 0 } } } = useQuery({
    queryKey: ["notificationCounts", user?.id],
    queryFn: () => BaseService.get<NotificationCounts>("/notifications/counts"),
    enabled: !!user,
    staleTime: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => BaseService.put(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["notificationCounts", user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => BaseService.put("/notifications/read-all", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["notificationCounts", user?.id] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => BaseService.delete(`/notifications/${id}`).then(() => null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["notificationCounts", user?.id] });
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-1">Stay updated with your alerts</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{counts.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{counts.unread}</p>
            <p className="text-sm text-muted-foreground">Unread</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Wrench className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold">{counts.byType.repair}</p>
            <p className="text-sm text-muted-foreground">Repairs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{counts.byType.score}</p>
            <p className="text-sm text-muted-foreground">Score</p>
          </CardContent>
        </Card>
      </div>

      <NotificationList
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDelete}
      />
    </div>
  );
}
