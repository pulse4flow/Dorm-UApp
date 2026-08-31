import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { MaintenanceForm } from "@/components/maintenance-form";
import { RepairStatus } from "@/components/repair-status";
import { REPAIR_CATEGORIES, repairCategoryLabel } from "@/lib/repairs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const recent = await prisma.repairRequest.findMany({
    select: { id: true, title: true, category: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return (
    <>
      <SiteHeader />
      <main>
        <div className="content">
          <div className="page-heading">
            <div><p className="eyebrow">Repair & maintenance</p><h1>Maintenance Request</h1></div>
            <span className="sync">No account needed — just fill the form.</span>
          </div>

          <div className="maintenance-grid">
            <section className="dash-card widget repair-form-panel">
              <h2>Submit a request</h2>
              <p className="widget-subtext">Tell us what&apos;s broken and our team will review it and update the status here.</p>
              <MaintenanceForm />
            </section>

            <section>
              <h2>Recent requests</h2>
              {recent.length === 0
                ? <div className="empty compact">No requests yet — be the first.</div>
                : <div className="repair-list">{recent.map((request) => (
                    <div className="repair-row" key={request.id}>
                      <div className="repair-meta">
                        <strong>{request.title}</strong>
                        <span>{repairCategoryLabel[request.category as (typeof REPAIR_CATEGORIES)[number]] ?? request.category} · submitted {new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                      <RepairStatus status={request.status} />
                    </div>
                  ))}</div>}
            </section>
          </div>

          <p className="sync maintenance-note">For emergencies — fire, gas leak, flooding — call the office directly instead of using this form. See <Link href="/dorm-info">Dorm Info</Link> for contact details.</p>
        </div>
      </main>
    </>
  );
}