export const REPAIR_CATEGORIES = ["PLUMBING", "ELECTRICAL", "AIRCON", "NETWORK", "FURNITURE", "OTHER"] as const;
export type RepairCategory = (typeof REPAIR_CATEGORIES)[number];

export const REPAIR_STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED"] as const;
export type RepairStatus = (typeof REPAIR_STATUSES)[number];

export const repairCategoryLabel: Record<RepairCategory, string> = {
  PLUMBING: "Plumbing / water leak",
  ELECTRICAL: "Electrical / power",
  AIRCON: "Air conditioner",
  NETWORK: "Wi-Fi / network",
  FURNITURE: "Furniture / fixture",
  OTHER: "Other",
};

export const repairStatusLabel: Record<RepairStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};