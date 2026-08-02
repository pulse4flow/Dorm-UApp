"use client";

import { useState } from "react";
import { ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnnouncementImage } from "@/types";
import { AnnouncementService } from "@/services";

interface AnnouncementGalleryProps {
  images: AnnouncementImage[];
  canManage?: boolean;
  onRemove?: (image: AnnouncementImage) => void;
}

export function AnnouncementGallery({
  images,
  canManage = false,
  onRemove,
}: AnnouncementGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<AnnouncementImage | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <ImageIcon className="mr-2 h-5 w-5" />
        No images attached
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
            <button
              type="button"
              className="h-full w-full cursor-zoom-in"
              onClick={() => setSelectedImage(image)}
              aria-label="View image"
            >
              <img
                src={AnnouncementService.imageUrl(image.imageUrl)}
                alt="Announcement attachment"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
            {canManage && onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                onClick={() => onRemove(image)}
                aria-label="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-3">
          <DialogHeader className="sr-only">
            <DialogTitle>Announcement image preview</DialogTitle>
            <DialogDescription>Expanded image preview</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <img
              src={AnnouncementService.imageUrl(selectedImage.imageUrl)}
              alt="Announcement attachment preview"
              className="max-h-[80vh] w-full rounded-md object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
