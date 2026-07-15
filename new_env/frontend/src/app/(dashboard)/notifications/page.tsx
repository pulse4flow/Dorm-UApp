"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import { NotificationList } from "@/features/notifications";
import { Notification, NotificationCounts } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Megaphone, Wrench, Award, Users } from "lucide-react";

const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: 1,
    title: "Maintenance Request Updated",
    message: "Your plumbing repair request has been assigned to a technician.",
    type: "repair",
    isRead: false,
    createdAt: new Date(2026, 5, 10, 14, 30),
    updatedAt: new Date(2026, 5, 10, 14, 30),
  },
  {
    id: "2",
    userId: 1,
    title: "New Announcement",
    message: "Water maintenance scheduled for May 28th.",
    type: "announcement",
    isRead: true,
    createdAt: new Date(2026, 5, 9, 10, 0),
    updatedAt: new Date(2026, 5, 9, 10, 0),
  },
  {
    id: "3",
    userId: 1,
    title: "Score Updated",
    message: "Your dormitory score has been updated to 85.",
    type: "score",
    isRead: false,
    createdAt: new Date(2026, 5, 8, 9, 0),
    updatedAt: new Date(2026, 5, 8, 9, 0),
  },
];

const mockCounts: NotificationCounts = {
  total: 3,
  unread: 2,
  byType: {
    announcement: 1,
    repair: 1,
    activity: 0,
    score: 1,
    system: 0,
  },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [counts] = useState<NotificationCounts>(mockCounts);

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, updatedAt: new Date() } : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((n) => ({ ...n, isRead: true, updatedAt: new Date() }))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
            <Megaphone className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold">{counts.byType.announcement}</p>
            <p className="text-sm text-muted-foreground">Announcements</p>
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
