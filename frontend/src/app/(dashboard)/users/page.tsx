"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { UserList } from "@/features/users";
import { UserProfile, UserRole } from "@/types";
import { UserService } from "@/services/user.service";
import { toast } from "sonner";

export default function UsersPage() {
  const { isManager, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => UserService.getAll(),
    enabled: isManager,
    staleTime: 30000,
  });

  const addUserMutation = useMutation({
    mutationFn: (data: {
      username: string;
      password: string;
      name: string;
      role: UserRole;
      studentId?: string;
      roomId?: string;
      dormScore?: number;
    }) => UserService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: {
        name?: string;
        role?: UserRole;
        studentId?: string;
        roomId?: string;
        dormScore?: number;
        password?: string;
      };
    }) => UserService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number | string) => UserService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="h-64 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!isManager) {
    return null;
  }

  const students = users.filter((u) => u.role === "student");
  const managers = users.filter((u) => u.role === "manager");

  const handleAdd = (data: {
    username: string;
    password: string;
    name: string;
    role: UserRole;
    studentId?: string;
    roomId?: string;
    dormScore?: number;
  }) => {
    addUserMutation.mutate(data);
  };

  const handleEdit = (
    id: number | string,
    data: {
      name?: string;
      role?: UserRole;
      studentId?: string;
      roomId?: string;
      dormScore?: number;
      password?: string;
    }
  ) => {
    updateUserMutation.mutate({ id, data });
  };

  const handleDelete = (id: number | string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Create and manage accounts (max 3 students / 2 managers)
        </p>
      </div>

      <UserList
        users={users as UserProfile[]}
        studentSlotsLeft={Math.max(0, 3 - students.length)}
        managerSlotsLeft={Math.max(0, 2 - managers.length)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
