import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ error: "Invalid input", details: error.flatten() }, { status: 400 });
  if (error instanceof Error && error.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (error instanceof Error && error.message.includes("Unique constraint")) return NextResponse.json({ error: "That value already exists." }, { status: 409 });
  console.error(error);
  return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
}
