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
  password?: string;
  name: string;
  roomId: string;
  dormScore?: number;
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
      roomId: "",
      dormScore: 100,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          studentId: initialData.studentId || "",
          name: initialData.name || "",
          roomId: initialData.roomId || "",
          dormScore: initialData.dormScore ?? 100,
          password: "",
        });
      } else {
        reset({
          studentId: "",
          password: "",
          name: "",
          roomId: "",
          dormScore: 100,
        });
      }
    }
  }, [open, initialData, reset]);

  const generateStudentId = () => {
    const numbers = existingIds
      .map((id) => parseInt(id.replace(/[^0-9]/g, ""), 10))
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 100;
    const nextNum = maxNum + 1;
    const newId = `STU-${nextNum.toString().padStart(3, "0")}`;
    setValue("studentId", newId);
  };

  const onFormSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    try {
      onSubmit({
        ...data,
        dormScore: data.dormScore ? Number(data.dormScore) : 100,
      });
      toast.success(
        mode === "create"
          ? "Student record created successfully"
          : "Student record updated successfully"
      );
      onClose();
      reset();
    } catch {
      toast.error("Something went wrong processing request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Student Record" : "Edit Student Record"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <div className="flex gap-2">
              <Input
                id="studentId"
                placeholder="STU-101"
                disabled={isLoading || mode === "edit"}
                {...register("studentId", {
                  required: "Student ID is required",
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Arun Somchai"
              disabled={isLoading}
              {...register("name", {
                required: "Full name is required",
              })}
            />
            {errors.name && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.name.message}</span>
              </div>
            )}
          </div>

          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                disabled={isLoading}
                {...register("password", {
                  required: "Password is required for user account creation",
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
          )}

          <div className="space-y-2">
            <Label htmlFor="roomId">Dorm Room</Label>
            <Input
              id="roomId"
              placeholder="A-101"
              disabled={isLoading}
              {...register("roomId", {
                required: "Dorm room is required",
              })}
            />
            {errors.roomId && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.roomId.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dormScore">Dorm Score (0–100)</Label>
            <Input
              id="dormScore"
              type="number"
              min={0}
              max={100}
              placeholder="100"
              disabled={isLoading}
              {...register("dormScore", {
                min: { value: 0, message: "Minimum score is 0" },
                max: { value: 100, message: "Maximum score is 100" },
              })}
            />
            {errors.dormScore && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.dormScore.message}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-6">
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
                ? "Create Student"
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
