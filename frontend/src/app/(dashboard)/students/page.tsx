"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { StudentList } from "@/features/students";
import { StudentWithUser } from "@/types";
import { BaseService, PaginatedResponse } from "@/services/api-base";

export default function StudentsPage() {
  const { isManager, isLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: () => BaseService.get<PaginatedResponse<StudentWithUser>>("/students"),
    select: (data) => data?.data || [],
    enabled: isManager,
    staleTime: 30000,
  });

  const createStudentMutation = useMutation({
    mutationFn: (data: { studentId: string; name: string; roomId: string; userId: number }) =>
      BaseService.post<StudentWithUser>("/students", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { studentId?: string; name?: string; roomId?: string } }) =>
      BaseService.put<StudentWithUser>(`/students/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) => BaseService.delete(`/students/${id}`).then(() => null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
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

  const handleAdd = (data: { studentId: string; name: string; roomId: string; userId: number }) => {
    createStudentMutation.mutate(data);
  };

  const handleEdit = (id: string, data: { studentId?: string; name?: string; roomId?: string }) => {
    updateStudentMutation.mutate({ id, data });
  };

  const handleDelete = (id: string) => {
    deleteStudentMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resident Management</h1>
        <p className="text-muted-foreground">
          Manage resident IDs and accounts
        </p>
      </div>

      <StudentList
        students={students}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
