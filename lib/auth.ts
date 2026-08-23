import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "dormdash_admin";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET);

function assertSecret() {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters.");
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAdminSession(adminId: string) {
  assertSecret();
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

export async function getAdminId() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !process.env.AUTH_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const id = await getAdminId();
  if (!id) throw new Error("UNAUTHORIZED");
  return id;
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 8 },
  };
}

export const clearSessionCookie = { name: COOKIE_NAME, value: "", options: { httpOnly: true, path: "/", maxAge: 0 } };
