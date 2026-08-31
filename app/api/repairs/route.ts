import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { repairInput } from "@/lib/validation";
import { apiError } from "@/lib/http";

const publicRepairSelect = { id: true, title: true, category: true, status: true, createdAt: true } as const;

export async function GET() {
  try {
    const requests = await prisma.repairRequest.findMany({ select: publicRepairSelect, orderBy: { createdAt: "desc" } });
    return NextResponse.json(requests);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = repairInput.parse(await request.json());
    const created = await prisma.repairRequest.create({ data: input });
    const { id, title, category, status, createdAt } = created;
    return NextResponse.json({ id, title, category, status, createdAt }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}