import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { announcementInclude, getPublicAnnouncements } from "@/lib/announcements";
import { announcementInput } from "@/lib/validation";
import { apiError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const admin = new URL(request.url).searchParams.get("admin") === "true";
  try {
    if (admin) {
      await requireAdmin();
      return NextResponse.json(await prisma.announcement.findMany({ include: announcementInclude, orderBy: { updatedAt: "desc" } }));
    }
    return NextResponse.json(await getPublicAnnouncements());
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const input = announcementInput.parse(await request.json());
    const announcement = await prisma.announcement.create({
      data: {
        ...input,
        publishAt: input.publishAt ? new Date(input.publishAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        eventAt: input.eventAt ? new Date(input.eventAt) : null,
        tags: { create: input.tagIds.map((tagId) => ({ tagId })) },
        attachments: { connect: input.attachmentIds.map((id) => ({ id })) },
      },
      include: announcementInclude,
    });
    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
