import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/http";
import { credentialsInput } from "@/lib/validation";
import { createAdminSession, sessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = credentialsInput.parse(await request.json());
    const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const response = NextResponse.json({ id: admin.id, email: admin.email });
    response.cookies.set(sessionCookie(await createAdminSession(admin.id)));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
