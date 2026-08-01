export interface Room {
  id: string;
  roomNumber: string;
  building: string;
  floor: number;
  capacity: number;
  status: "available" | "occupied" | "maintenance";
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomWithStudents extends Room {
  students: {
    id: string;
    studentId: string;
    name: string;
  }[];
}

export type RoomStatus = "available" | "occupied" | "maintenance";
