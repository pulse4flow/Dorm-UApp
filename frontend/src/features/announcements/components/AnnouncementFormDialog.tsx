"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Announcement, AnnouncementFormData, AnnouncementImage } from "@/types";
import { AnnouncementService } from "@/services";
import { AnnouncementGallery } from "./AnnouncementGallery";

interface AnnouncementFormDialogProps {
  announcement: Announcement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function AnnouncementFormDialog({
  announcement,
  open,
  onOpenChange,
  onSaved,
}: AnnouncementFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [content, setContent] = useState(announcement?.content ?? "");
  const [existingImages, setExistingImages] = useState(announcement?.images ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (selectedFiles: File[]) => {
    setError(null);
    try {
      const nextFiles = [...files, ...selectedFiles];
      if (existingImages.length + nextFiles.length > 5) {
        throw new Error("An announcement can contain at most 5 images.");
      }
      for (const file of selectedFiles) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          throw new Error("Only JPEG, PNG, and WebP images are allowed.");
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Each image must be 5 MB or smaller.");
        }
      }
      setFiles(nextFiles);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to add images.");
    }
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addFiles(Array.from(event.dataTransfer.files));
  };

  const handleSave = async () => {
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError("A title and announcement content are required.");
      return;
    }

    setIsSaving(true);
    try {
      const data: AnnouncementFormData = { title: title.trim(), content: content.trim() };
      const savedAnnouncement = announcement
        ? await AnnouncementService.update(announcement.id, data)
        : await AnnouncementService.create(data);

      if (files.length > 0) {
        await AnnouncementService.uploadImages(
          savedAnnouncement.id,
          files,
          existingImages.length,
          setProgress,
        );
      }
      onSaved();
      onOpenChange(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save announcement.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeExistingImage = async (image: AnnouncementImage) => {
    if (!announcement) return;
    setError(null);
    try {
      await AnnouncementService.removeImage(announcement.id, image.id);
      setExistingImages((current) => current.filter((currentImage) => currentImage.id !== image.id));
      onSaved();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove image.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{announcement ? "Edit announcement" : "Create announcement"}</DialogTitle>
          <DialogDescription>
            Publish a message and attach up to five JPEG, PNG, or WebP images.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="announcement-title">Title</label>
            <Input
              id="announcement-title"
              value={title}
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSaving}
            />
          </div>
          <div>
            <label htmlFor="announcement-content">Content</label>
            <Textarea
              id="announcement-content"
              value={content}
              maxLength={10000}
              rows={6}
              onChange={(event) => setContent(event.target.value)}
              disabled={isSaving}
            />
          </div>

          {existingImages.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Existing images</p>
              <AnnouncementGallery images={existingImages} canManage onRemove={removeExistingImage} />
            </div>
          )}

          <div
            className="cursor-pointer rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:bg-muted/50"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => event.key === "Enter" && fileInputRef.current?.click()}
          >
            <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            <p className="font-medium">Drag and drop images here</p>
            <p className="mt-1 text-sm text-muted-foreground">or click to browse (maximum 5 MB each)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md bg-muted p-2 text-sm">
                  <span className="truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {isSaving && files.length > 0 && (
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Uploading images</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {announcement ? "Save changes" : "Publish announcement"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
