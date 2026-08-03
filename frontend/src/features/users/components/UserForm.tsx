"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { UserRole } from "@/types";

interface UserFormData {
  username: string;
  password?: string;
  name: string;
  studentId?: string;
  roomId?: string;
  dormScore?: number;
}

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    username: string;
    password: string;
    name: string;
    role: UserRole;
    studentId?: string;
    roomId?: string;
    dormScore?: number;
  }) => void;
  initialData?: UserFormData & { role: UserRole };
  existingUsernames?: string[];
  role?: UserRole;
  mode?: "create" | "edit";
  studentSlotsLeft: number;
  managerSlotsLeft: number;
}

export function UserForm({
  open,
  onClose,
  onSubmit,
  initialData,
  existingUsernames = [],
  role: initialRole = "student",
  mode = "create",
  studentSlotsLeft,
  managerSlotsLeft,
}: UserFormProps) {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UserFormData>({
    defaultValues: initialData || {
      username: "",
      password: "",
      name: "",
      studentId: "",
      roomId: "",
      dormScore: 100,
    },
  });

  useEffect(() => {
    if (open) {
      setRole(initialData?.role || initialRole);
      if (initialData) {
        reset({
          username: initialData.username || "",
          name: initialData.name || "",
          studentId: initialData.studentId || "",
          roomId: initialData.roomId || "",
          dormScore: initialData.dormScore ?? 100,
          password: "",
        });
      } else {
        reset({
          username: "",
          password: "",
          name: "",
          studentId: "",
          roomId: "",
          dormScore: 100,
        });
      }
    }
  }, [open, initialData, initialRole, reset]);

  const generateUsername = () => {
    const base = role === "manager" ? "manager" : "student";
    const numbers = existingUsernames
      .filter((u) => u.startsWith(base))
      .map((u) => parseInt(u.replace(/[^0-9]/g, ""), 10))
      .filter((n) => !isNaN(n));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    setValue("username", `${base}${String(nextNum).padStart(2, "0")}`);
  };

  const onFormSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      onSubmit({
        username: data.username,
        password: data.password || (mode === "create" ? data.username : ""),
        name: data.name,
        role,
        studentId: data.studentId,
        roomId: data.roomId,
        dormScore:
          data.dormScore !== undefined
            ? Number(data.dormScore)
            : undefined,
      });
      toast.success(
        mode === "create"
          ? "User account created successfully"
          : "User account updated successfully"
      );
      onClose();
      reset();
    } catch {
      toast.error("Something went wrong processing request");
    } finally {
      setIsLoading(false);
    }
  };

  const isManagerDisabled =
    mode === "create"
      ? managerSlotsLeft <= 0
      : initialData?.role !== "manager" && managerSlotsLeft <= 0;
  const isStudentDisabled =
    mode === "create"
      ? studentSlotsLeft <= 0
      : initialData?.role !== "student" && studentSlotsLeft <= 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create User Account" : "Edit User Account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id="role" disabled={isStudentDisabled && isManagerDisabled}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student" disabled={isStudentDisabled}>
                  Student ({studentSlotsLeft} slot{studentSlotsLeft === 1 ? "" : "s"} left)
                </SelectItem>
                <SelectItem value="manager" disabled={isManagerDisabled}>
                  Manager ({managerSlotsLeft} slot{managerSlotsLeft === 1 ? "" : "s"} left)
                </SelectItem>
              </SelectContent>
            </Select>
            {isStudentDisabled && isManagerDisabled && (
              <p className="text-xs text-destructive">
                User limit reached (3 students / 2 managers).
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">User ID</Label>
            <div className="flex gap-2">
              <Input
                id="username"
                placeholder={role === "manager" ? "manager01" : "student101"}
                disabled={isLoading || mode === "edit"}
                {...register("username", {
                  required: "User ID is required",
                  pattern: {
                    value: /^[a-zA-Z0-9_.-]+$/,
                    message: "Only letters, numbers, dots, dashes, underscores",
                  },
                })}
              />
              {mode === "create" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateUsername}
                  disabled={isLoading}
                >
                  Auto
                </Button>
              )}
            </div>
            {errors.username && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.username.message}</span>
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

          <div className="space-y-2">
            <Label htmlFor="password">
              {mode === "create" ? "Password" : "Reset Password"}
            </Label>
            <PasswordInput
              id="password"
              placeholder={
                mode === "create"
                  ? `Default: ${role === "manager" ? "manager01" : "student101"}`
                  : "Leave blank to keep current password"
              }
              disabled={isLoading}
              {...register("password", {
                required: false,
                minLength: {
                  value: 4,
                  message: "Password must be at least 4 characters",
                },
              })}
            />
            {errors.password && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.password.message}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {mode === "create"
                ? "Leave blank to use the User ID as the password."
                : "Enter a new password to reset it."}
            </p>
          </div>

          {role === "student" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="STU-104"
                  disabled={isLoading}
                  {...register("studentId", {
                    required: false,
                  })}
                />
                {errors.studentId && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.studentId.message}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {mode === "edit" && initialData?.role !== "student"
                    ? "Required when converting to a student."
                    : "Leave blank to use the User ID."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomId">Dorm Room</Label>
                <Input
                  id="roomId"
                  placeholder="A-101"
                  disabled={isLoading}
                  {...register("roomId", {
                    required: "Dorm room is required for students",
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
            </>
          )}

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
                ? "Create User"
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
