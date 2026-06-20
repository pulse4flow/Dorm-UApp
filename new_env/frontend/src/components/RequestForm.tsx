"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { X, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface MaintenanceRequest {
  id: string;
  roomNumber: string;
  category: string;
  priority: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  createdAt: Date;
  imageUrl?: string;
}

interface RequestFormProps {
  onSubmit: (
    request: Omit<MaintenanceRequest, "id" | "status" | "createdAt">
  ) => void;
  onClose: () => void;
}

interface FormData {
  roomNumber: string;
  category: string;
  priority: string;
  description: string;
}

export function RequestForm({ onSubmit, onClose }: RequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      imageUrl: imagePreview || undefined,
    });
    toast.success("Maintenance request submitted successfully");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Maintenance Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              type="text"
              {...register("roomNumber", {
                required: "Room number is required",
              })}
              placeholder="e.g., A-204"
            />
            {errors.roomNumber && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  {errors.roomNumber.message}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watch("category")}
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" {...register("category", { required: "Category is required" })} />
            {errors.category && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  {errors.category.message}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={watch("priority")}
              onValueChange={(value) => setValue("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Can wait a few days</SelectItem>
                <SelectItem value="medium">Medium - Needs attention soon</SelectItem>
                <SelectItem value="high">High - Needs urgent attention</SelectItem>
                <SelectItem value="urgent">Urgent - Immediate safety concern</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" {...register("priority", { required: "Priority is required" })} />
            {errors.priority && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  {errors.priority.message}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description", {
                required: "Description is required",
              })}
              rows={4}
              placeholder="Describe the issue in detail..."
            />
            {errors.description && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  {errors.description.message}
                </span>
              </div>
            )}
          </div>

          <div>
            <Label className="mb-2 block">Photo (Optional)</Label>
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Click to upload image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
