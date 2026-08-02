"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { RequestCard, RequestForm, RepairStatsCard } from "@/features/repairs";
import { RepairWithDetails, RepairFormData, RepairStats } from "@/types";
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

  const { data: repairs = [], isLoading: loadingRepairs } = useQuery({
    queryKey: ["repairs"],
    queryFn: () => BaseService.get<PaginatedResponse<RepairWithDetails>>("/repairs"),
    select: (data) => data?.data || [],
    enabled: !!user,
    staleTime: 30000,
  });

  const createRepairMutation = useMutation({
    mutationFn: (data: RepairFormData) => BaseService.post<RepairWithDetails>("/repairs", data),
    onSuccess: (newRepair) => {
      queryClient.setQueryData(["repairs"], (old: any) => {
        if (!old) return [newRepair];
        return [newRepair, ...old];
      });
      setShowForm(false);
    },
  });

  const updateRepairStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      BaseService.put(`/repairs/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });
    },
  });

  const stats: RepairStats = {
    total: repairs.length,
    pending: repairs.filter((r) => r.status === "pending").length,
    inProgress: repairs.filter((r) => r.status === "in_progress").length,
    resolved: repairs.filter((r) => r.status === "resolved").length,
  };

  const handleSubmitRequest = (data: RepairFormData) => {
    createRepairMutation.mutate(data);
  };

  const handleStatusChange = (id: string, status: "pending" | "in_progress" | "resolved") => {
    updateRepairStatusMutation.mutate({ id, status });
  };

  const filteredRepairs = repairs.filter((req) => {
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesCategory = filterCategory === "all" || req.category === filterCategory;
    const matchesSearch =
      searchQuery === "" ||
      req.room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase());
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
              placeholder="Search by room number or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
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
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold mb-2">No requests found</h3>
          <p className="text-muted-foreground">
            {searchQuery || filterStatus !== "all" || filterCategory !== "all"
              ? "Try adjusting your filters"
              : "Submit your first maintenance request"}
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
