export interface AnnouncementImage {
  id: string;
  announcementId: string;
  imageUrl: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  images: AnnouncementImage[];
}

export interface AnnouncementFormData {
  title: string;
  content: string;
}
