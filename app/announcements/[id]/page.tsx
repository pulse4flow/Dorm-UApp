import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Countdown } from "@/components/countdown";
import { AnnouncementDetailActions } from "@/components/announcement-detail-actions";
import { announcementInclude, isVisible } from "@/lib/announcements";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const announcement = await prisma.announcement.findUnique({ where: { id: (await params).id }, include: announcementInclude });
  if (!announcement || !isVisible(announcement)) notFound();
  return <><SiteHeader /><main className="content detail"><p className="eyebrow">{announcement.category?.name ?? "General"}</p><h1>{announcement.title}</h1><div className="details"><span>Published {announcement.publishAt?.toLocaleDateString()}</span>{announcement.eventAt && <Countdown target={announcement.eventAt.toISOString()} />}</div>{announcement.imageUrl && <img className="detail-image" src={announcement.imageUrl} alt="" />}<p className="detail-copy">{announcement.content}</p><div className="tags">{announcement.tags.map(({ tag }) => <span key={tag.id}>#{tag.name}</span>)}</div><AnnouncementDetailActions id={announcement.id} />{announcement.attachments.length > 0 && <section className="attachments"><h2>Attachments</h2>{announcement.attachments.map((attachment) => <a key={attachment.id} className="attachment" href={attachment.url} download>📄 {attachment.fileName} <span>Download</span></a>)}</section>}</main></>;
}
