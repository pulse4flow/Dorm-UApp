import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const daysFromNow = (days: number, hour = 9) => {
  const date = new Date(Date.now() + days * 86400000);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const categories = [
  { name: "Academic", color: "#2563eb" },
  { name: "Dorm life", color: "#0d9488" },
  { name: "Events", color: "#7c3aed" },
  { name: "Health & safety", color: "#dc2626" },
  { name: "Maintenance", color: "#b45309" },
];

const tags = [
  "exam",
  "academic",
  "events",
  "maintenance",
  "dorm",
  "community",
  "safety",
  "room",
  "wlan",
];

const announcements = [
  {
    id: "seed-midterm-schedule",
    title: "Midterm Examination Schedule",
    summary: "The examination schedule has been released. Review your dates and materials now.",
    content:
      "Our midterm examination window runs from Monday of next week through the following Friday.\n\nPlease:\n• Check your personal schedule on the faculty portal\n• Verify you have the correct room for each paper\n• Bring your student ID for every session\n\nGood luck to everyone — remember to rest, hydrate, and start revision early.",
    status: "PUBLISHED",
    priority: "IMPORTANT",
    publishAt: daysFromNow(-3, 8),
    expiresAt: daysFromNow(16),
    eventAt: daysFromNow(3, 9),
    category: "Academic",
    tags: ["exam", "academic"],
  },
  {
    id: "seed-fire-drill",
    title: "Quarterly Fire Drill — Thursday Morning",
    summary: "Mandatory fire drill this week. Evacuate to the courtyard when you hear the alarm.",
    content:
      "A fire drill will take place this Thursday at 09:30.\n\nWhen the alarm sounds:\n• Stop what you are doing immediately\n• Close your door and window\n• Walk — do not run — to the courtyard assembly point\n• Wait for the roll call before returning\n\nEveryone must participate unless you have a certified exemption. This is also a requirement for your dorm deposit record.",
    status: "PUBLISHED",
    priority: "URGENT",
    publishAt: daysFromNow(-1, 10),
    expiresAt: daysFromNow(6),
    eventAt: daysFromNow(2, 9),
    category: "Health & safety",
    tags: ["safety", "dorm"],
  },
  {
    id: "seed-community-dinner",
    title: "Community Dinner & Game Night",
    summary: "Meet your neighbours this Friday. Free food, board games, and a movie after dinner.",
    content:
      "The residents committee is hosting a community dinner this Friday at 18:00 in the lobby lounge.\n\nFood is free for all residents — bring a dish if you like, but it's not required. We'll have board games, a movie screening at 20:00, and a prize for the most creative dish.\n\nSee you there!",
    status: "PUBLISHED",
    priority: "NORMAL",
    publishAt: daysFromNow(-2, 12),
    expiresAt: daysFromNow(4),
    eventAt: daysFromNow(4, 18),
    category: "Events",
    tags: ["events", "community"],
  },
  {
    id: "seed-wifi-maintenance",
    title: "Wi-Fi Upgrade — Brief Disruptions Tonight",
    summary: "Core network equipment is being upgraded tonight between 01:00 and 03:00.",
    content:
      "Our internet provider is upgrading the core router tonight between 01:00 and 03:00.\n\nYou may lose connectivity for 20–30 minutes during this window. After the upgrade, all access points will broadcast a faster and more stable signal.\n\nIf your connection does not recover by 07:00, contact maintenance.",
    status: "PUBLISHED",
    priority: "IMPORTANT",
    publishAt: daysFromNow(-1, 15),
    expiresAt: daysFromNow(1),
    eventAt: daysFromNow(1, 2),
    category: "Maintenance",
    tags: ["maintenance", "wlan"],
  },
  {
    id: "seed-room-checks",
    title: "Annual Room Safety Inspection",
    summary: "Maintenance will inspect every room over the next two weeks for safety compliance.",
    content:
      "As part of the annual safety check, maintenance will visit every room over the next two weeks.\n\nWhat we check:\n• Smoke detector batteries\n• Electrical sockets and wiring\n• Window and door locks\n• Water pressure\n\nYou'll receive a notice under your door the day before your visit. Let staff in when they arrive, or reschedule by replying to the notice.",
    status: "PUBLISHED",
    priority: "NORMAL",
    publishAt: daysFromNow(-4, 9),
    expiresAt: daysFromNow(12),
    eventAt: null,
    category: "Maintenance",
    tags: ["maintenance", "safety", "room"],
  },
  {
    id: "seed-welcome-party",
    title: "Welcome Party for New Residents",
    summary: "A party to welcome new residents — the date has passed but photos are now available.",
    content:
      "Thank you to everyone who joined the welcome party last month! It was a wonderful evening.\n\nPhotos from the evening are now available to view in the lobby gallery, and the residents Facebook group.\n\nWe hope everyone has settled in well. If you have any questions about dorm life, the front office is always happy to help.",
    status: "ARCHIVED",
    priority: "NORMAL",
    publishAt: daysFromNow(-30, 9),
    expiresAt: daysFromNow(-20),
    eventAt: daysFromNow(-25, 18),
    category: "Events",
    tags: ["events", "community"],
  },
  {
    id: "seed-trash-schedule",
    title: "Recycling & Trash Collection Reminder",
    summary: "Trash is collected daily at 07:00. Recycling goes in the green bins only.",
    content:
      "A quick reminder about waste at Dormpoon Hall:\n\n• General trash: bins by the lift on every floor, collected daily at 07:00\n• Recycling: green bins only, at the ground floor service room\n• Large items (furniture, electronics): book a pickup at the front office\n\nPlease sort your waste — it keeps the dorm clean and reduces fees for everyone.",
    status: "PUBLISHED",
    priority: "NORMAL",
    publishAt: daysFromNow(-6, 8),
    expiresAt: daysFromNow(20),
    eventAt: null,
    category: "Dorm life",
    tags: ["dorm"],
  },
  {
    id: "seed-exam-prep",
    title: "Quiet Hours Extended During Exam Week (draft)",
    summary: "Proposal to extend evening quiet hours during the exam period.",
    content:
      "The residents committee is considering extending quiet hours to 21:00 during midterm and final exam weeks.\n\nThe proposal is still being reviewed. Feedback can be left at the front office until this Friday. If approved, the change will apply starting next Monday.",
    status: "DRAFT",
    priority: "NORMAL",
    publishAt: null,
    expiresAt: null,
    eventAt: null,
    category: "Dorm life",
    tags: ["dorm", "exam"],
  },
];

const repairs = [
  {
    id: "seed-repair-101",
    room: "B-512",
    requesterName: "Anong",
    title: "Bathroom sink is leaking",
    description: "Water pools under the sink since yesterday, even with the tap closed.",
    category: "PLUMBING",
    status: "PENDING",
  },
  {
    id: "seed-repair-102",
    room: "C-210",
    requesterName: "Kai",
    title: "Power socket sparking",
    description: "The socket near the desk makes a small spark when I plug something in.",
    category: "ELECTRICAL",
    status: "IN_PROGRESS",
  },
  {
    id: "seed-repair-103",
    room: "A-104",
    requesterName: "Mint",
    title: "Air conditioner dripping in bedroom",
    description: "Unit drips water onto the floor when running more than an hour.",
    category: "AIRCON",
    status: "IN_PROGRESS",
  },
  {
    id: "seed-repair-104",
    room: "D-303",
    requesterName: null,
    title: "Wi-Fi dead in room after 22:00",
    description: "Connection drops every night after 10 PM; works fine during the day.",
    category: "NETWORK",
    status: "PENDING",
  },
  {
    id: "seed-repair-105",
    room: "B-218",
    requesterName: "Pinto",
    title: "Broken desk drawer",
    description: "Bottom drawer fell off its rail and will not close properly.",
    category: "FURNITURE",
    status: "RESOLVED",
  },
  {
    id: "seed-repair-106",
    room: "C-105",
    requesterName: "Gift",
    title: "Corridor light flickering on 3F",
    description: "The ceiling light near room C-105 flickers constantly and is quite bright.",
    category: "ELECTRICAL",
    status: "RESOLVED",
  },
];

async function main() {
  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { name: category.name },
      update: { color: category.color },
      create: category,
    });
    categoryMap.set(category.name, record.id);
  }

  const tagMap = new Map<string, string>();
  for (const name of tags) {
    const record = await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
    tagMap.set(name, record.id);
  }

  for (const announcement of announcements) {
    const { id, category, tags: announcementTags, ...data } = announcement;
    await prisma.announcement.upsert({
      where: { id },
      update: {
        ...data,
        categoryId: categoryMap.get(category)!,
        tags: { deleteMany: {}, create: announcementTags.map((tag) => ({ tagId: tagMap.get(tag)! })) },
      },
      create: {
        ...data,
        id,
        categoryId: categoryMap.get(category)!,
        tags: { create: announcementTags.map((tag) => ({ tagId: tagMap.get(tag)! })) },
      },
    });
  }

  for (const repair of repairs) {
    await prisma.repairRequest.upsert({
      where: { id: repair.id },
      update: { status: repair.status, category: repair.category },
      create: repair,
    });
  }

  const adminPasswordHash = await bcrypt.hash("dormdash-admin-1234", 12);
  await prisma.admin.upsert({
    where: { email: "admin@dormpoon.example" },
    update: { passwordHash: adminPasswordHash },
    create: { email: "admin@dormpoon.example", passwordHash: adminPasswordHash },
  });

  console.log("Seed complete:");
  console.log(`  announcements  ${await prisma.announcement.count()}`);
  console.log(`  repairs        ${await prisma.repairRequest.count()}`);
  console.log(`  categories     ${await prisma.category.count()}`);
  console.log(`  tags           ${await prisma.tag.count()}`);
  console.log(`  admin          admin@dormpoon.example / dormdash-admin-1234`);
}

main().finally(() => prisma.$disconnect());