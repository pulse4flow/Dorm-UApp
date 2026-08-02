"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnnouncementGallery } from "@/features/announcements";
import { AnnouncementService } from "@/services";
import { useAuth } from "@/hooks";

export default function AnnouncementDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: announcement, isLoading, isError } = useQuery({
    queryKey: ["announcement", params.id],
    queryFn: () => AnnouncementService.get(params.id),
    enabled: Boolean(user && params.id),
  });

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-8"><div className="h-72 animate-pulse rounded-xl bg-muted" /></div>;
  }

  if (isError || !announcement) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">This announcement could not be found.</p>
        <Button asChild variant="outline" className="mt-4"><Link href="/announcements">Back to announcements</Link></Button>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <Button asChild variant="ghost" className="mb-5">
        <Link href="/announcements"><ArrowLeft className="h-4 w-4" />Back to announcements</Link>
      </Button>
      <div className="rounded-xl border bg-card p-5 sm:p-8">
        <p className="text-sm text-muted-foreground">
          {new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" }).format(new Date(announcement.createdAt))}
        </p>
        <h1 className="mt-2 text-3xl font-bold">{announcement.title}</h1>
        <div className="mt-5 whitespace-pre-wrap leading-7 text-foreground">{announcement.content}</div>
        {announcement.images.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Images</h2>
            <AnnouncementGallery images={announcement.images} />
          </section>
        )}
      </div>
    </article>
  );
}
