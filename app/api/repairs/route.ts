import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { repairInput } from "@/lib/validation";
import { apiError } from "@/lib/http";

export async function GET() {
  try {
    const requests = await prisma.repairRequest.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(requests);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = repairInput.parse(await request.json());
    const created = await prisma.repairRequest.create({ data: input });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}