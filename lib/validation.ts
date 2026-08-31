import { z } from "zod";

const date = z.string().datetime().nullable().optional();

export const announcementInput = z.object({
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(3).max(400),
  content: z.string().trim().min(3).max(20000),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  priority: z.enum(["NORMAL", "IMPORTANT", "URGENT"]).default("NORMAL"),
  publishAt: date,
  expiresAt: date,
  eventAt: date,
  imageUrl: z.string().max(250).nullable().optional(),
  categoryId: z.string().cuid().nullable().optional(),
  tagIds: z.array(z.string().cuid()).max(12).default([]),
  attachmentIds: z.array(z.string().cuid()).max(8).default([]),
}).superRefine((value, ctx) => {
  if (value.publishAt && value.expiresAt && new Date(value.publishAt) >= new Date(value.expiresAt)) {
    ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "Expiry must be after publish date." });
  }
});

export const namedEntityInput = z.object({
  name: z.string().trim().min(2).max(40).regex(/^[\p{L}\p{N} -]+$/u, "Use letters, numbers, spaces, or hyphens."),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const credentialsInput = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
});

const repairCategories = ["PLUMBING", "ELECTRICAL", "AIRCON", "NETWORK", "FURNITURE", "OTHER"] as const;
const repairStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED"] as const;

export const repairInput = z.object({
  room: z.string().trim().min(1).max(20),
  requesterName: z.string().trim().max(80).optional().transform((value) => (value ? value : null)),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(3).max(4000),
  category: z.enum(repairCategories).default("OTHER"),
});

export const repairStatusInput = z.object({
  status: z.enum(repairStatuses),
});
