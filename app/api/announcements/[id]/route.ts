import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { announcementInclude, isVisible } from "@/lib/announcements";
import { announcementInput } from "@/lib/validation";
import { apiError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const id = (await params).id;
    const admin = new URL(request.url).searchParams.get("admin") === "true";
    if (admin) await requireAdmin();
    const record = await prisma.announcement.findUnique({ where: { id }, include: announcementInclude });
    if (!record || (!admin && !isVisible(record))) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const input = announcementInput.parse(await request.json());
    const record = await prisma.announcement.update({
      where: { id: (await params).id },
      data: {
        ...input,
        publishAt: input.publishAt ? new Date(input.publishAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        eventAt: input.eventAt ? new Date(input.eventAt) : null,
        tags: { deleteMany: {}, create: input.tagIds.map((tagId) => ({ tagId })) },
        attachments: { set: input.attachmentIds.map((id) => ({ id })) },
      },
      include: announcementInclude,
    });
    return NextResponse.json(record);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    await requireAdmin();
    await prisma.announcement.delete({ where: { id: (await params).id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
