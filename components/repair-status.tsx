import { REPAIR_STATUSES, repairStatusLabel } from "@/lib/repairs";

export function RepairStatus({ status }: { status: string }) {
  const label = status in repairStatusLabel ? repairStatusLabel[status as (typeof REPAIR_STATUSES)[number]] : status;
  return <span className={`chip status-${status.toLowerCase()}`}>{label}</span>;
}