"use client";

import { useState } from "react";
import { Plus, Search, Shield } from "lucide-react";
import {
  RequestForm,
  MaintenanceRequest,
} from "@/components/RequestForm";
import { RequestCard } from "@/components/RequestCard";
import { BroadcastBox, Broadcast } from "@/components/BroadcastBox";
import { AdminBroadcastForm } from "@/components/AdminBroadcastForm";

export default function MaintenancePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([
    {
      id: "1",
      title: "Scheduled Water Maintenance",
      message:
        "Water will be shut off in Building A on May 28th from 9 AM to 12 PM for pipe maintenance.",
      type: "warning",
      createdAt: new Date(2026, 4, 27, 8, 0),
    },
  ]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([
    {
      id: "1",
      roomNumber: "A-204",
      category: "plumbing",
      priority: "high",
      description:
        "Bathroom sink is leaking. Water drips constantly from the faucet.",
      status: "in-progress",
      createdAt: new Date(2026, 4, 23, 14, 30),
    },
    {
      id: "2",
      roomNumber: "B-105",
      category: "electrical",
      priority: "urgent",
      description:
        "Light fixture in the bedroom is sparking. Safety hazard.",
      status: "pending",
      createdAt: new Date(2026, 4, 24, 9, 15),
    },
    {
      id: "3",
      roomNumber: "C-302",
      category: "hvac",
      priority: "medium",
      description:
        "Air conditioning not cooling properly. Room temperature is too warm.",
      status: "resolved",
      createdAt: new Date(2026, 4, 20, 16, 45),
    },
  ]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSubmitRequest = (
    requestData: Omit<MaintenanceRequest, "id" | "status" | "createdAt">
  ) => {
    const newRequest: MaintenanceRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date(),
    };
    setRequests([newRequest, ...requests]);
  };

  const handleStatusChange = (
    id: string,
    status: MaintenanceRequest["status"]
  ) => {
    setRequests(
      requests.map((req) => (req.id === id ? { ...req, status } : req))
    );
  };

  const handleBroadcast = (
    broadcastData: Omit<Broadcast, "id" | "createdAt">
  ) => {
    const newBroadcast: Broadcast = {
      ...broadcastData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBroadcasts([newBroadcast, ...broadcasts]);
  };

  const handleDismissBroadcast = (id: string) => {
    setBroadcasts(broadcasts.filter((b) => b.id !== id));
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus =
      filterStatus === "all" || req.status === filterStatus;
    const matchesCategory =
      filterCategory === "all" || req.category === filterCategory;
    const matchesSearch =
      searchQuery === "" ||
      req.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "in-progress").length,
    resolved: requests.filter((r) => r.status === "resolved").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1>Maintenance Requests</h1>
            <p className="text-muted-foreground mt-1">
              Submit and track maintenance requests for your dorm room
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                isAdmin
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <Shield className="w-4 h-4" />
              {isAdmin ? "Admin Mode" : "Resident Mode"}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Request
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-6">
            <AdminBroadcastForm onBroadcast={handleBroadcast} />
          </div>
        )}

        <BroadcastBox
          broadcasts={broadcasts}
          onDismiss={handleDismissBroadcast}
        />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl mb-1">{stats.total}</div>
            <div className="text-sm text-muted-foreground">
              Total Requests
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl mb-1 text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl mb-1 text-blue-600">
              {stats.inProgress}
            </div>
            <div className="text-sm text-muted-foreground">
              In Progress
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl mb-1 text-green-600">
              {stats.resolved}
            </div>
            <div className="text-sm text-muted-foreground">Resolved</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by room number or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Categories</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="furniture">Furniture</option>
            <option value="hvac">HVAC</option>
            <option value="cleaning">Cleaning</option>
            <option value="security">Security</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="mb-2">No requests found</h3>
          <p className="text-muted-foreground">
            {searchQuery ||
            filterStatus !== "all" ||
            filterCategory !== "all"
              ? "Try adjusting your filters"
              : "Submit your first maintenance request"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onStatusChange={handleStatusChange}
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
