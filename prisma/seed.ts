import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const academic = await prisma.category.upsert({
    where: { name: "Academic" },
    update: {},
    create: { name: "Academic", color: "#2563eb" },
  });
  const exam = await prisma.tag.upsert({ where: { name: "exam" }, update: {}, create: { name: "exam" } });
  await prisma.announcement.upsert({
    where: { id: "seed-midterm-schedule" },
    update: {},
    create: {
      id: "seed-midterm-schedule",
      title: "Midterm Examination Schedule",
      summary: "The examination schedule has been released.",
      content: "Please review your examination dates and prepare the required materials.",
      status: "PUBLISHED",
      priority: "IMPORTANT",
      publishAt: new Date(),
      expiresAt: new Date(Date.now() + 21 * 86400000),
      eventAt: new Date(Date.now() + 14 * 86400000),
      categoryId: academic.id,
      tags: { create: { tagId: exam.id } },
    },
  });
}

main().finally(() => prisma.$disconnect());
