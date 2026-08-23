import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const announcementInclude = {
  category: true,
  tags: { include: { tag: true } },
  attachments: true,
} satisfies Prisma.AnnouncementInclude;

export type AnnouncementRecord = Prisma.AnnouncementGetPayload<{ include: typeof announcementInclude }>;

export function isVisible(record: Pick<AnnouncementRecord, "status" | "publishAt" | "expiresAt">, now = new Date()) {
  return record.status === "PUBLISHED" &&
    (!record.publishAt || record.publishAt <= now) &&
    (!record.expiresAt || record.expiresAt >= now);
}

export async function getPublicAnnouncements() {
  const records = await prisma.announcement.findMany({
    include: announcementInclude,
    where: { status: "PUBLISHED", OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }] },
    orderBy: [{ priority: "desc" }, { publishAt: "desc" }],
  });
  return records.filter((record) => isVisible(record));
}
