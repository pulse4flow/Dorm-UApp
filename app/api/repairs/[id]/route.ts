import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { repairStatusInput } from "@/lib/validation";
import { apiError } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  try {
    await requireAdmin();
    const record = await prisma.repairRequest.findUnique({ where: { id: (await params).id } });
    if (!record) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const input = repairStatusInput.parse(await request.json());
    const record = await prisma.repairRequest.update({
      where: { id: (await params).id },
      data: { status: input.status },
      select: { id: true, room: true, requesterName: true, title: true, description: true, category: true, status: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(record);
  } catch (error) {
    return apiError(error);
  }
}