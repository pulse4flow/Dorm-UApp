import { notFound, redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { AnnouncementEditor } from "@/components/announcement-editor";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function EditAnnouncement({ params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { redirect("/admin/login"); }
  const item = await prisma.announcement.findUnique({ where: { id: (await params).id }, include: { tags: true, attachments: true } });
  if (!item) notFound();
  return <><AdminNav /><main className="admin-content"><h1>Edit announcement</h1><AnnouncementEditor initial={{ ...item, publishAt: item.publishAt?.toISOString(), expiresAt: item.expiresAt?.toISOString(), eventAt: item.eventAt?.toISOString(), tagIds: item.tags.map((tag) => tag.tagId), attachmentIds: item.attachments.map((attachment) => attachment.id) }} /></main></>;
}
