import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/http";
import { namedEntityInput } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  return NextResponse.json(await prisma.tag.findMany({ orderBy: { name: "asc" } }));
}
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { name } = namedEntityInput.parse(await request.json());
    return NextResponse.json(await prisma.tag.create({ data: { name: name.toLowerCase() } }), { status: 201 });
  } catch (error) { return apiError(error); }
}
