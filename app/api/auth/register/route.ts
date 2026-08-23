import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/http";
import { credentialsInput } from "@/lib/validation";
import { createAdminSession, hashPassword, sessionCookie } from "@/lib/auth";
import { z } from "zod";

const registrationInput = credentialsInput.extend({ registrationKey: z.string().min(1).max(256) });

export async function POST(request: Request) {
  try {
    const { email, password, registrationKey } = registrationInput.parse(await request.json());
    if (!process.env.ADMIN_REGISTRATION_KEY || registrationKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return NextResponse.json({ error: "Invalid registration key." }, { status: 403 });
    }
    const admin = await prisma.admin.create({ data: { email: email.toLowerCase(), passwordHash: await hashPassword(password) } });
    const response = NextResponse.json({ id: admin.id, email: admin.email }, { status: 201 });
    response.cookies.set(sessionCookie(await createAdminSession(admin.id)));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
