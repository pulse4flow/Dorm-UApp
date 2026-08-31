"use client";

import { useMemo, useState } from "react";
import { REPAIR_CATEGORIES, REPAIR_STATUSES, repairCategoryLabel, repairStatusLabel } from "@/lib/repairs";
import { RepairStatus } from "@/components/repair-status";

type Repair = {
  id: string;
  room: string;
  requesterName: string | null;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string | Date;
};

export function RepairsManager({ initial }: { initial: Repair[] }) {
  const [requests, setRequests] = useState(initial);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => requests.filter((request) =>
    (statusFilter === "ALL" || request.status === statusFilter) &&
    (categoryFilter === "ALL" || request.category === categoryFilter)),
  [requests, statusFilter, categoryFilter]);

  const updateStatus = async (id: string, status: string) => {
    setBusy(id);
    setError(null);
    try {
      const response = await fetch(`/api/repairs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Update failed.");
      }
      setRequests((previous) => previous.map((request) => request.id === id ? { ...request, status } : request));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Update failed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="filters admin-filters">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          {REPAIR_STATUSES.map((status) => <option key={status} value={status}>{repairStatusLabel[status]}</option>)}
        </select>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category">
          <option value="ALL">All categories</option>
          {REPAIR_CATEGORIES.map((category) => <option key={category} value={category}>{repairCategoryLabel[category]}</option>)}
        </select>
        <span className="result-count">{filtered.length} request{filtered.length === 1 ? "" : "s"}</span>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="admin-table">
        {filtered.map((request) => (
          <div className="repair-admin-row" key={request.id}>
            <div className="repair-admin-main">
              <strong>{request.title} <span className="chip chip-room">Room {request.room}</span></strong>
              <span>{repairCategoryLabel[request.category as (typeof REPAIR_CATEGORIES)[number]] ?? request.category} · {request.requesterName ? `by ${request.requesterName}` : "anonymous"} · submitted {new Date(request.createdAt).toLocaleDateString()}</span>
              <p>{request.description}</p>
            </div>
            <div className="repair-admin-actions">
              <RepairStatus status={request.status} />
              <select value={request.status} onChange={(event) => updateStatus(request.id, event.target.value)} disabled={busy === request.id} aria-label="Update status">
                {REPAIR_STATUSES.map((status) => <option key={status} value={status}>{repairStatusLabel[status]}</option>)}
              </select>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty">No requests match these filters.</div>}
      </div>
    </>
  );
}