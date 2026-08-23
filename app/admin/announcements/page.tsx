import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function AdminAnnouncements() {
  try { await requireAdmin(); } catch { redirect("/admin/login"); }
  const announcements = await prisma.announcement.findMany({ include: { category: true }, orderBy: { updatedAt: "desc" } });
  return <><AdminNav /><main className="admin-content"><div className="page-heading"><h1>Announcements</h1><Link className="button" href="/admin/announcements/new">+ New announcement</Link></div><div className="admin-table">{announcements.map((item) => <div key={item.id}><div><strong>{item.title}</strong><span>{item.category?.name ?? "Uncategorized"} · {item.status} · {item.priority}</span></div><Link className="button secondary" href={`/admin/announcements/${item.id}/edit`}>Edit</Link></div>)}{announcements.length === 0 && <div className="empty">No announcements yet.</div>}</div></main></>;
}
