"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import { RequestCard, RequestForm, RepairStatsCard } from "@/features/repairs";
import { BroadcastBox } from "@/features/announcements";
import { RepairWithDetails, RepairFormData, RepairStats, AnnouncementWithAuthor } from "@/types";
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

const mockRepairs: RepairWithDetails[] = [
  {
    id: "1",
    studentId: "STU-042",
    roomId: "room-1",
    category: "plumbing",
    priority: "high",
    description: "Bathroom sink is leaking. Water drips constantly from the faucet.",
    status: "in-progress",
    createdAt: new Date(2026, 4, 23, 14, 30),
    updatedAt: new Date(2026, 4, 23, 14, 30),
    student: {
      id: "STU-042",
      studentId: "STU-042",
      name: "John Doe",
    },
    room: {
      id: "room-1",
      roomNumber: "A-204",
      building: "Building A",
    },
  },
  {
    id: "2",
    studentId: "STU-001",
    roomId: "room-2",
    category: "electrical",
    priority: "urgent",
    description: "Light fixture in the bedroom is sparking. Safety hazard.",
    status: "pending",
    createdAt: new Date(2026, 4, 24, 9, 15),
    updatedAt: new Date(2026, 4, 24, 9, 15),
    student: {
      id: "STU-001",
      studentId: "STU-001",
      name: "Alice Smith",
    },
    room: {
      id: "room-2",
      roomNumber: "B-105",
      building: "Building B",
    },
  },
];

const mockAnnouncements: AnnouncementWithAuthor[] = [
  {
    id: "1",
    title: "Scheduled Water Maintenance",
    message: "Water will be shut off in Building A on May 28th from 9 AM to 12 PM.",
    type: "warning",
    createdBy: 1,
    createdAt: new Date(2026, 4, 27, 8, 0),
    updatedAt: new Date(2026, 4, 27, 8, 0),
    author: { id: 1, name: "Admin Manager", email: "admin@dorm.com" },
  },
];

export default function RepairsPage() {
  const { user, isManager } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [repairs, setRepairs] = useState<RepairWithDetails[]>(mockRepairs);
  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>(mockAnnouncements);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const stats: RepairStats = {
    total: repairs.length,
    pending: repairs.filter((r) => r.status === "pending").length,
    inProgress: repairs.filter((r) => r.status === "in-progress").length,
    resolved: repairs.filter((r) => r.status === "resolved").length,
  };

  const handleSubmitRequest = (data: RepairFormData) => {
    const userId = String(user?.id || "");
    const newRepair: RepairWithDetails = {
      id: Date.now().toString(),
      studentId: userId,
      roomId: "room-1",
      ...data,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      student: {
        id: userId,
        studentId: userId,
        name: user?.name || "",
      },
      room: {
        id: "room-1",
        roomNumber: data.roomNumber,
        building: "Building A",
      },
    };
    setRepairs([newRepair, ...repairs]);
  };

  const handleStatusChange = (id: string, status: "pending" | "in-progress" | "resolved") => {
    setRepairs(repairs.map((r) => (r.id === id ? { ...r, status, updatedAt: new Date() } : r)));
  };

  const handleDismissAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
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
              <SelectItem value="in-progress">In Progress</SelectItem>
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
