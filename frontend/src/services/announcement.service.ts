import { api } from "@/lib/api";
import { Announcement, AnnouncementFormData, AnnouncementImage } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function validateImages(files: File[], existingCount = 0) {
  if (existingCount + files.length > MAX_IMAGES) {
    throw new Error(`An announcement can contain at most ${MAX_IMAGES} images.`);
  }
  for (const file of files) {
    if (!ACCEPTED_TYPES.has(file.type)) {
      throw new Error("Only JPEG, PNG, and WebP images are allowed.");
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error("Each image must be 5 MB or smaller.");
    }
  }
}

export const AnnouncementService = {
  list: () => api.get<Announcement[]>("/announcements"),
  get: (id: string) => api.get<Announcement>(`/announcements/${id}`),
  create: (data: AnnouncementFormData) => api.post<Announcement>("/announcements", data),
  update: (id: string, data: AnnouncementFormData) =>
    api.put<Announcement>(`/announcements/${id}`, data),
  remove: (id: string) => api.delete<{ message: string }>(`/announcements/${id}`),
  removeImage: (announcementId: string, imageId: string) =>
    api.delete<{ message: string }>(`/announcements/${announcementId}/images/${imageId}`),
  imageUrl: (imageUrl: string) => `${API_URL}${imageUrl}`,
  uploadImages: (
    announcementId: string,
    files: File[],
    existingCount: number,
    onProgress: (progress: number) => void,
  ) => {
    validateImages(files, existingCount);
    const data = new FormData();
    files.forEach((file) => data.append("images", file));

    return new Promise<AnnouncementImage[]>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("POST", `${API_URL}/announcements/${announcementId}/images`);
      const token = localStorage.getItem("token");
      if (token) request.setRequestHeader("Authorization", `Bearer ${token}`);
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      };
      request.onerror = () => reject(new Error("Image upload failed."));
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText) as AnnouncementImage[]);
          return;
        }
        try {
          const response = JSON.parse(request.responseText) as { message?: string };
          reject(new Error(response.message || "Image upload failed."));
        } catch {
          reject(new Error("Image upload failed."));
        }
      };
      request.send(data);
    });
  },
};
