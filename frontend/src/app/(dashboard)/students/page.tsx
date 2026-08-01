"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { StudentList } from "@/features/students";

interface Student {
  id: string;
  studentId: string;
  password: string;
  name: string;
  roomNumber: string;
}

const initialStudents: Student[] = [
  { id: "1", studentId: "STU-001", password: "password123", name: "John Doe", roomNumber: "A-101" },
  { id: "2", studentId: "STU-002", password: "password123", name: "Jane Smith", roomNumber: "A-102" },
  { id: "3", studentId: "STU-003", password: "password123", name: "Bob Wilson", roomNumber: "B-201" },
];

export default function StudentsPage() {
  const { isManager, isLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(initialStudents);

  useEffect(() => {
    if (!isLoading && !isManager) {
      router.replace("/");
    }
  }, [isManager, isLoading, router]);

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

  const handleAdd = (data: Omit<Student, "id">) => {
    const newStudent: Student = {
      ...data,
      id: (students.length + 1).toString(),
    };
    setStudents([...students, newStudent]);
  };

  const handleEdit = (id: string, data: Omit<Student, "id">) => {
    setStudents(students.map((s) => (s.id === id ? { ...data, id } : s)));
  };

  const handleDelete = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
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
