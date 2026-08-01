export interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  maxParticipants: number | null;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityWithParticipants extends Activity {
  participants: ActivityParticipant[];
  _count: {
    participants: number;
  };
}

export interface ActivityParticipant {
  id: string;
  activityId: string;
  studentId: string;
  joinedAt: Date;
  student: {
    id: string;
    studentId: string;
    name: string;
  };
}

export interface ActivityFormData {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  maxParticipants?: number;
}

export interface ActivityFilter {
  status?: "upcoming" | "ongoing" | "completed";
  search?: string;
}
