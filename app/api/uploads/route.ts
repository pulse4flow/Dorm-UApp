import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/http";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const attachmentTypes = new Set([...imageTypes, "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip"]);
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx", "application/zip": "zip" };

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind");
    if (!(file instanceof File) || !["image", "attachment"].includes(String(kind))) return NextResponse.json({ error: "File and upload kind are required." }, { status: 400 });
    const allowed = kind === "image" ? imageTypes : attachmentTypes;
    const limit = kind === "image" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (!allowed.has(file.type) || file.size === 0 || file.size > limit) return NextResponse.json({ error: "Unsupported file type or size." }, { status: 400 });
    const filename = `${randomUUID()}.${extensions[file.type]}`;
    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    const url = `/uploads/${filename}`;
    if (kind === "image") return NextResponse.json({ url }, { status: 201 });
    return NextResponse.json(await prisma.attachment.create({ data: { fileName: file.name.slice(0, 180), mimeType: file.type, size: file.size, url } }), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
