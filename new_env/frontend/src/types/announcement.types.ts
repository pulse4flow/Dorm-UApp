export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "urgent";
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnouncementWithAuthor extends Announcement {
  author: {
    id: number;
    name: string;
    email: string;
  };
}

export type AnnouncementType = "info" | "warning" | "urgent";

export interface AnnouncementFormData {
  title: string;
  message: string;
  type: AnnouncementType;
}
