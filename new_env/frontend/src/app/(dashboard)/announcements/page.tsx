"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import { BroadcastBox, AdminBroadcastForm } from "@/features/announcements";
import { AnnouncementWithAuthor, AnnouncementFormData } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

const mockAnnouncements: AnnouncementWithAuthor[] = [
  {
    id: "1",
    title: "Scheduled Water Maintenance",
    message:
      "Water will be shut off in Building A on May 28th from 9 AM to 12 PM for pipe maintenance.",
    type: "warning",
    createdBy: 1,
    createdAt: new Date(2026, 4, 27, 8, 0),
    updatedAt: new Date(2026, 4, 27, 8, 0),
    author: {
      id: 1,
      name: "Admin Manager",
      email: "admin@dorm.com",
    },
  },
  {
    id: "2",
    title: "New Community Event",
    message:
      "Join us for a community BBQ this weekend at the common area. All residents are welcome!",
    type: "info",
    createdBy: 1,
    createdAt: new Date(2026, 5, 1, 10, 0),
    updatedAt: new Date(2026, 5, 1, 10, 0),
    author: {
      id: 1,
      name: "Admin Manager",
      email: "admin@dorm.com",
    },
  },
];

export default function AnnouncementsPage() {
  const { user, isManager } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>(mockAnnouncements);

  const handleBroadcast = (data: AnnouncementFormData) => {
    const newAnnouncement: AnnouncementWithAuthor = {
      id: Date.now().toString(),
      ...data,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: {
        id: 1,
        name: user?.name || "Admin",
        email: user?.email || "admin@dorm.com",
      },
    };
    setAnnouncements([newAnnouncement, ...announcements]);
  };

  const handleDismiss = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
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
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-muted-foreground mt-1">
          {isManager
            ? "Create and manage announcements for residents"
            : "View the latest updates and announcements"}
        </p>
      </div>

      {isManager && (
        <div className="mb-6">
          <AdminBroadcastForm onBroadcast={handleBroadcast} />
        </div>
      )}

      <BroadcastBox broadcasts={announcements} onDismiss={isManager ? handleDismiss : undefined} />
    </div>
  );
}
