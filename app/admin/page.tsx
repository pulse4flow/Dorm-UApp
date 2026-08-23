import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  try { await requireAdmin(); } catch { redirect("/admin/login"); }
  const [total, published, drafts, expiring, expired] = await Promise.all([prisma.announcement.count(), prisma.announcement.count({ where: { status: "PUBLISHED" } }), prisma.announcement.count({ where: { status: "DRAFT" } }), prisma.announcement.count({ where: { status: "PUBLISHED", expiresAt: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) } } }), prisma.announcement.count({ where: { expiresAt: { lt: new Date() } } })]);
  return <><AdminNav /><main className="admin-content"><div className="page-heading"><div><p className="eyebrow">Administration</p><h1>Dashboard</h1></div><Link className="button" href="/admin/announcements/new">+ New announcement</Link></div><div className="stats">{[["Total announcements", total], ["Published", published], ["Drafts", drafts], ["Expiring soon", expiring], ["Expired", expired]].map(([label, count]) => <div key={String(label)}><strong>{count}</strong><span>{label}</span></div>)}</div><section className="quick-actions"><Link href="/admin/announcements">Manage announcements</Link><Link href="/admin/categories">Manage categories</Link><Link href="/admin/tags">Manage tags</Link></section></main></>;
}
