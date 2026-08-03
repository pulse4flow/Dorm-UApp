"use client";

import { useState } from "react";
import { Search, Pencil, Trash2, Plus, Shield, User, Award, ShieldAlert } from "lucide-react";
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
import { UserForm } from "./UserForm";
import { UserProfile, UserRole } from "@/types";

interface UserListProps {
  users: UserProfile[];
  studentSlotsLeft: number;
  managerSlotsLeft: number;
  onAdd: (data: {
    username: string;
    password: string;
    name: string;
    role: UserRole;
    studentId?: string;
    roomId?: string;
    dormScore?: number;
  }) => void;
  onEdit: (
    id: number | string,
    data: {
      name?: string;
      role?: UserRole;
      studentId?: string;
      roomId?: string;
      dormScore?: number;
      password?: string;
    }
  ) => void;
  onDelete: (id: number | string) => void;
}

export function UserList({
  users,
  studentSlotsLeft,
  managerSlotsLeft,
  onAdd,
  onEdit,
  onDelete,
}: UserListProps) {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserProfile | null>(null);

  const filteredUsers = users.filter((u) => {
    const searchLower = search.toLowerCase();
    const usernameMatch = u.username.toLowerCase().includes(searchLower);
    const nameMatch = (u.name || "").toLowerCase().includes(searchLower);
    const roomMatch = (u.roomNumber || u.roomId || "").toLowerCase().includes(searchLower);
    const roleMatch = u.role.toLowerCase().includes(searchLower);
    return usernameMatch || nameMatch || roomMatch || roleMatch;
  });

  const handleEdit = (user: UserProfile) => {
    setEditTarget(user);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = (data: {
    username: string;
    password: string;
    name: string;
    role: UserRole;
    studentId?: string;
    roomId?: string;
    dormScore?: number;
  }) => {
    if (editTarget) {
      onEdit(editTarget.id, {
        name: data.name,
        role: data.role,
        studentId: data.studentId,
        roomId: data.roomId,
        dormScore: data.dormScore,
        password: data.password,
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

  const canAddAny = studentSlotsLeft > 0 || managerSlotsLeft > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by User ID, name, role, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setFormOpen(true)} disabled={!canAddAny}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {!canAddAny && (
        <p className="text-sm text-destructive">
          User limit reached (max 3 students / 2 managers). Delete a user to add a new one.
        </p>
      )}

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">User ID</TableHead>
              <TableHead className="font-semibold">Full Name</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Dorm Room</TableHead>
              <TableHead className="font-semibold">Dorm Score (0–100)</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {search ? "No users found matching your search query" : "No users available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isManager = user.role === "manager";
                const roomName = user.roomNumber || user.roomId || (isManager ? "—" : "N/A");
                const score = user.dormScore ?? null;

                return (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono font-medium text-primary">
                      {user.username}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      {user.studentId && (
                        <div className="text-xs text-muted-foreground">{user.studentId}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                          isManager
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            : "bg-secondary text-secondary-foreground border-border"
                        }`}
                      >
                        {isManager ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {isManager ? "Manager" : "Student"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        {roomName}
                      </span>
                    </TableCell>
                    <TableCell>
                      {score !== null ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getScoreBadgeClass(
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
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                          title="Edit User"
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(user.id)}
                          title="Delete User"
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

      <UserForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleSubmit}
        initialData={
          editTarget
            ? {
                username: editTarget.username,
                name: editTarget.name,
                studentId: editTarget.studentId || "",
                roomId: editTarget.roomNumber || editTarget.roomId,
                dormScore: editTarget.dormScore,
                role: editTarget.role,
              }
            : undefined
        }
        existingUsernames={users.map((u) => u.username)}
        role={editTarget?.role || "student"}
        mode={editTarget ? "edit" : "create"}
        studentSlotsLeft={studentSlotsLeft}
        managerSlotsLeft={managerSlotsLeft}
      />
    </div>
  );
}
