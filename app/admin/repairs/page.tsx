import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { RepairsManager } from "@/components/admin/repairs-manager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminRepairs() {
  try { await requireAdmin(); } catch { redirect("/admin/login"); }
  const requests = await prisma.repairRequest.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <AdminNav />
      <main className="admin-content">
        <div className="page-heading">
          <div><p className="eyebrow">Maintenance</p><h1>Repair Requests</h1></div>
          <Link className="button secondary" href="/maintenance">View public page</Link>
        </div>
        <RepairsManager initial={requests} />
      </main>
    </>
  );
}