"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { Announcement } from "@/types";
import { AnnouncementService } from "@/services";
import { AnnouncementFormDialog } from "@/features/announcements";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AnnouncementsPage() {
  const { user, isManager } = useAuth();
  const queryClient = useQueryClient();
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: AnnouncementService.list,
    enabled: Boolean(user),
  });
  const deleteMutation = useMutation({
    mutationFn: AnnouncementService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });

  const openCreate = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleDelete = (announcement: Announcement) => {
    if (window.confirm(`Delete "${announcement.title}" and all of its images?`)) {
      deleteMutation.mutate(announcement.id);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="mt-1 text-muted-foreground">
            {isManager ? "Create and manage dormitory announcements." : "Stay informed about dormitory updates."}
          </p>
        </div>
        {isManager && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create announcement
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => <div key={item} className="h-56 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <Megaphone className="mx-auto mb-3 h-8 w-8" />
          No announcements have been published yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {announcements.map((announcement) => {
            const thumbnail = announcement.images[0];
            return (
              <article key={announcement.id} className="overflow-hidden rounded-xl border bg-card">
                <Link href={`/announcements/${announcement.id}`} className="block">
                  <div className="aspect-[16/7] bg-muted">
                    {thumbnail ? (
                      <img
                        src={AnnouncementService.imageUrl(thumbnail.imageUrl)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="mr-2 h-5 w-5" />
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-muted-foreground">{formatDate(announcement.createdAt)}</p>
                    <h2 className="mt-1 text-xl font-semibold">{announcement.title}</h2>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-muted-foreground">{announcement.content}</p>
                  </div>
                </Link>
                {isManager && (
                  <div className="flex justify-end gap-2 border-t p-3">
                    <Button variant="outline" size="sm" onClick={() => openEdit(announcement)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(announcement)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {isManager && (
        <AnnouncementFormDialog
          key={editingAnnouncement?.id ?? "new"}
          announcement={editingAnnouncement}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["announcements"] })}
        />
      )}
    </div>
  );
}
