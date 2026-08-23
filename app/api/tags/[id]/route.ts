import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/http";
import { namedEntityInput } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { name } = namedEntityInput.parse(await request.json());
    return NextResponse.json(await prisma.tag.update({ where: { id: (await params).id }, data: { name: name.toLowerCase() } }));
  } catch (error) { return apiError(error); }
}
export async function DELETE(_: Request, { params }: Context) {
  try {
    await requireAdmin();
    await prisma.tag.delete({ where: { id: (await params).id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
