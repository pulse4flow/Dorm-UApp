"use client";

import { useState } from "react";
import { Search, Pencil, Trash2, Plus, ShieldAlert, Award } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentForm } from "./StudentForm";
import { ScoreAdjustForm } from "@/features/score";
import { StudentWithUser, ScoreAdjustment } from "@/types";
import { BaseService } from "@/services/api-base";

interface StudentListProps {
  students: StudentWithUser[];
  onAdd: (data: {
    studentId: string;
    name: string;
    roomId: string;
    dormScore?: number;
    password?: string;
    email?: string;
  }) => void;
  onEdit: (
    id: string,
    data: { studentId?: string; name?: string; roomId?: string; dormScore?: number }
  ) => void;
  onDelete: (id: string) => void;
}

export function StudentList({ students, onAdd, onEdit, onDelete }: StudentListProps) {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StudentWithUser | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<StudentWithUser | null>(null);

  const queryClient = useQueryClient();

  const adjustScoreMutation = useMutation({
    mutationFn: (data: ScoreAdjustment) => BaseService.post("/score/adjust", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["scoreHistoryByStudent"] });
      setAdjustTarget(null);
    },
  });

  const filteredStudents = students.filter((s) => {
    const searchLower = search.toLowerCase();
    const studentIdMatch = s.studentId.toLowerCase().includes(searchLower);
    const nameMatch = s.name.toLowerCase().includes(searchLower);
    const roomMatch = s.room?.roomNumber?.toLowerCase().includes(searchLower) || s.roomId.toLowerCase().includes(searchLower);
    return studentIdMatch || nameMatch || roomMatch;
  });

  const handleEdit = (student: StudentWithUser) => {
    setEditTarget(student);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = (data: {
    studentId: string;
    name: string;
    roomId: string;
    dormScore?: number;
    password?: string;
    email?: string;
  }) => {
    if (editTarget) {
      onEdit(editTarget.id, {
        studentId: data.studentId,
        name: data.name,
        roomId: data.roomId,
        dormScore: data.dormScore,
      });
    } else {
      onAdd(data);
    }
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (score >= 50) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Student Record
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Student ID</TableHead>
              <TableHead className="font-semibold">Full Name</TableHead>
              <TableHead className="font-semibold">Dorm Room</TableHead>
              <TableHead className="font-semibold">Dorm Score (0–100)</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {search ? "No student records found matching your search query" : "No student records available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                const userType = student.user?.type || "student";
                const roomName = student.room?.roomNumber || student.roomId;
                const score = student.dormScore ?? 100;

                return (
                  <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono font-medium text-primary">
                      {student.studentId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        {student.user?.email && (
                          <div className="text-xs text-muted-foreground">{student.user.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        {roomName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdjustTarget(student)}
                          title="Click to adjust dorm score with mandatory reason"
                          className="group focus:outline-none"
                        >
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-transform group-hover:scale-105 ${getScoreBadgeClass(
                              score
                            )}`}
                          >
                            {score >= 80 ? (
                              <Award className="w-3 h-3" />
                            ) : (
                              <ShieldAlert className="w-3 h-3" />
                            )}
                            {score} / 100
                          </span>
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 capitalize">
                        {userType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAdjustTarget(student)}
                          title="Adjust Score"
                          className="text-xs text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Award className="w-3.5 h-3.5 mr-1" />
                          Adjust Score
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(student)}
                          title="Edit Student"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(student.id)}
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <StudentForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
        initialData={
          editTarget
            ? {
                studentId: editTarget.studentId,
                name: editTarget.name,
                roomId: editTarget.room?.roomNumber || editTarget.roomId,
                dormScore: editTarget.dormScore,
              }
            : undefined
        }
        existingIds={students.map((s) => s.studentId)}
        mode={editTarget ? "edit" : "create"}
      />

      {adjustTarget && (
        <ScoreAdjustForm
          studentId={adjustTarget.id}
          studentName={adjustTarget.name}
          currentScore={adjustTarget.dormScore ?? 100}
          onSubmit={(data) => adjustScoreMutation.mutate(data)}
          onClose={() => setAdjustTarget(null)}
        />
      )}
    </div>
  );
}
