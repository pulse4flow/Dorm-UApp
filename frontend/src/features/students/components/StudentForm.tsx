"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AlertCircle, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface StudentFormData {
  studentId: string;
  password: string;
  name: string;
  roomNumber: string;
}

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => void;
  initialData?: StudentFormData;
  existingIds?: string[];
  mode?: "create" | "edit";
}

export function StudentForm({
  open,
  onClose,
  onSubmit,
  initialData,
  existingIds = [],
  mode = "create",
}: StudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StudentFormData>({
    defaultValues: initialData || {
      studentId: "",
      password: "",
      name: "",
      roomNumber: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          studentId: "",
          password: "",
          name: "",
          roomNumber: "",
        });
      }
    }
  }, [open, initialData, reset]);

  const generateStudentId = () => {
    const numbers = existingIds.map((id) =>
      parseInt(id.replace("STU-", ""), 10)
    );
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNum = maxNum + 1;
    const newId = `STU-${nextNum.toString().padStart(3, "0")}`;
    setValue("studentId", newId);
  };

  const onFormSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSubmit(data);
      toast.success(
        mode === "create"
          ? "Resident ID created successfully"
          : "Resident updated successfully"
      );
      onClose();
      reset();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Resident ID" : "Edit Resident"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <div className="flex gap-2">
              <Input
                id="studentId"
                placeholder="STU-001"
                disabled={isLoading || mode === "edit"}
                {...register("studentId", {
                  required: "Student ID is required",
                  pattern: {
                    value: /^STU-\d{3,}$/,
                    message: "Format: STU-XXX (e.g., STU-001)",
                  },
                })}
              />
              {mode === "create" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateStudentId}
                  disabled={isLoading}
                >
                  <Dices className="w-4 h-4 mr-1" />
                  Generate
                </Button>
              )}
            </div>
            {errors.studentId && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.studentId.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              disabled={isLoading}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.password.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              disabled={isLoading}
              {...register("name", {
                required: "Name is required",
              })}
            />
            {errors.name && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.name.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              placeholder="A-204"
              disabled={isLoading}
              {...register("roomNumber", {
                required: "Room number is required",
                pattern: {
                  value: /^[A-Z]-\d{3}$/,
                  message: "Format: X-NNN (e.g., A-204)",
                },
              })}
            />
            {errors.roomNumber && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.roomNumber.message}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : mode === "create"
                ? "Create Resident ID"
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
