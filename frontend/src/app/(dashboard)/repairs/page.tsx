"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { RequestCard, RequestForm, RepairStatsCard } from "@/features/repairs";
import { RepairWithDetails, RepairFormData, RepairStats, RepairStatus } from "@/types";
import { BaseService, PaginatedResponse } from "@/services/api-base";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RepairsPage() {
  const { user, isManager } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const endpoint = isManager ? "/repairs" : "/repairs/my-requests";

  const { data: repairsData, isLoading: loadingRepairs } = useQuery({
    queryKey: ["repairs", isManager],
    queryFn: async () => {
      const res = await BaseService.get<any>(endpoint);
      if (Array.isArray(res)) return res as RepairWithDetails[];
      return ((res as PaginatedResponse<RepairWithDetails>)?.data || []) as RepairWithDetails[];
    },
    enabled: !!user,
    staleTime: 0, // Real-time updates for student and manager views
    refetchInterval: 5000, // Poll every 5s for live updates
  });

  const repairs: RepairWithDetails[] = repairsData || [];

  const createRepairMutation = useMutation({
    mutationFn: (data: RepairFormData) => BaseService.post<RepairWithDetails>("/repairs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
      setShowForm(false);
    },
  });

  const updateRepairStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RepairStatus }) =>
      BaseService.put(`/repairs/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["repairs"] });
      queryClient.setQueryData(["repairs", isManager], (old: RepairWithDetails[] | undefined) => {
        if (!old) return [];
        return old.map((item) =>
          item.id === id
            ? { ...item, status, updatedAt: new Date(), updatedBy: user?.name || "Manager" }
            : item
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
      queryClient.invalidateQueries({ queryKey: ["repairStats"] });
    },
  });

  const stats: RepairStats = {
    total: repairs.length,
    pending: repairs.filter((r) => r.status === "pending").length,
    inProgress: repairs.filter((r) => r.status === "in_progress").length,
    completed: repairs.filter((r) => r.status === "completed" || r.status === "resolved").length,
    rejected: repairs.filter((r) => r.status === "rejected").length,
  };

  const handleSubmitRequest = (data: RepairFormData) => {
    createRepairMutation.mutate(data);
  };

  const handleStatusChange = (id: string, status: RepairStatus) => {
    updateRepairStatusMutation.mutate({ id, status });
  };

  // Filter repairs by both status filter and student search (studentId / name / description)
  const filteredRepairs = repairs.filter((req) => {
    const normStatus = req.status === "resolved" ? "completed" : req.status;
    const matchesStatus = filterStatus === "all" || normStatus === filterStatus;
    const matchesCategory = filterCategory === "all" || req.category === filterCategory;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      (req.student?.studentId && req.student.studentId.toLowerCase().includes(q)) ||
      (req.student?.name && req.student.name.toLowerCase().includes(q)) ||
      (req.room?.roomNumber && req.room.roomNumber.toLowerCase().includes(q)) ||
      (req.description && req.description.toLowerCase().includes(q));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Maintenance Requests</h1>
            <p className="text-muted-foreground mt-1">
              {isManager
                ? "Manage and update maintenance requests from residents"
                : "Submit and track maintenance requests for your dorm room"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isManager ? "default" : "secondary"} className="text-sm">
              {isManager ? (
                <Shield className="w-3 h-3 mr-1" />
              ) : (
                <User className="w-3 h-3 mr-1" />
              )}
              {isManager ? "Manager" : "Resident"}
            </Badge>
            {!isManager && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-5 h-5" />
                New Request
              </Button>
            )}
          </div>
        </div>

        <RepairStatsCard stats={stats} />

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by Student ID, Name, or Room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="hvac">HVAC</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredRepairs.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <h3 className="text-lg font-semibold mb-2">No repair requests found.</h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery || filterStatus !== "all" || filterCategory !== "all"
              ? "Try adjusting your search terms or status filter."
              : "Submit your first maintenance request."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRepairs.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onStatusChange={handleStatusChange}
              isManager={isManager}
            />
          ))}
        </div>
      )}

      {showForm && (
        <RequestForm
          onSubmit={handleSubmitRequest}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
