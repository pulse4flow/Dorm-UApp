export interface Repair {
  id: string;
  studentId: string;
  roomId: string;
  category: RepairCategory;
  priority: RepairPriority;
  description: string;
  status: RepairStatus;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepairWithDetails extends Repair {
  student: {
    id: string;
    studentId: string;
    name: string;
  };
  room: {
    id: string;
    roomNumber: string;
    building: string;
  };
}

export type RepairCategory =
  | "plumbing"
  | "electrical"
  | "furniture"
  | "hvac"
  | "cleaning"
  | "security"
  | "other";

export type RepairPriority = "low" | "medium" | "high" | "urgent";

export type RepairStatus = "pending" | "in-progress" | "resolved";

export interface RepairFormData {
  roomNumber: string;
  category: RepairCategory;
  priority: RepairPriority;
  description: string;
  imageUrl?: string;
}

export interface RepairStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
}
