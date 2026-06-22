"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  User,
  Award,
  TrendingUp,
  Wrench,
  FileText,
  Calendar,
  Shield,
  AlertCircle,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ScoreLog {
  id: string;
  studentId: string;
  studentName: string;
  previousScore: number;
  newScore: number;
  reason: string;
  changedBy: string;
  createdAt: Date;
}

interface Student {
  id: string;
  name: string;
  room: string;
  dormScore: number;
}

interface ScoreFormData {
  studentId: string;
  score: string;
  reason: string;
}

const mockStudents: Student[] = [
  { id: "STU-042", name: "John Doe", room: "A-204", dormScore: 85 },
  { id: "STU-001", name: "Alice Smith", room: "B-105", dormScore: 92 },
  { id: "STU-078", name: "Bob Johnson", room: "C-302", dormScore: 68 },
  { id: "STU-033", name: "Carol White", room: "A-110", dormScore: 78 },
  { id: "STU-055", name: "David Lee", room: "B-201", dormScore: 45 },
];

const mockScoreLogs: ScoreLog[] = [
  {
    id: "log1",
    studentId: "STU-042",
    studentName: "John Doe",
    previousScore: 90,
    newScore: 85,
    reason: "Late noise complaint violation on May 15th",
    changedBy: "Admin Manager",
    createdAt: new Date(2026, 4, 16, 10, 0),
  },
  {
    id: "log2",
    studentId: "STU-042",
    studentName: "John Doe",
    previousScore: 85,
    newScore: 82,
    reason: "Missed room inspection appointment",
    changedBy: "Admin Manager",
    createdAt: new Date(2026, 4, 20, 14, 30),
  },
  {
    id: "log3",
    studentId: "STU-001",
    studentName: "Alice Smith",
    previousScore: 88,
    newScore: 92,
    reason: "Excellent participation in community event",
    changedBy: "Admin Manager",
    createdAt: new Date(2026, 4, 22, 9, 0),
  },
  {
    id: "log4",
    studentId: "STU-078",
    studentName: "Bob Johnson",
    previousScore: 75,
    newScore: 68,
    reason: "Repeated parking violation in resident zone",
    changedBy: "Admin Manager",
    createdAt: new Date(2026, 5, 1, 11, 15),
  },
];

export default function MainDashboard() {
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [scoreLogs, setScoreLogs] = useState<ScoreLog[]>(mockScoreLogs);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ScoreFormData>();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const isManager = user?.role === "manager";

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-destructive";
  };

  const getScoreRating = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Fair";
    if (score >= 60) return "Needs Improvement";
    return "Poor";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleAdjustScore = (data: ScoreFormData) => {
    const student = students.find((s) => s.id === data.studentId);
    if (!student) return;

    const newScore = parseInt(data.score);
    if (isNaN(newScore) || newScore < 0 || newScore > 100) {
      toast.error("Score must be between 0 and 100");
      return;
    }

    const log: ScoreLog = {
      id: Date.now().toString(),
      studentId: student.id,
      studentName: student.name,
      previousScore: student.dormScore,
      newScore,
      reason: data.reason,
      changedBy: user.name,
      createdAt: new Date(),
    };

    setStudents(
      students.map((s) =>
        s.id === data.studentId ? { ...s, dormScore: newScore } : s
      )
    );
    setScoreLogs([log, ...scoreLogs]);

    if (user.id === student.id || user.room === student.room) {
      setUser({ ...user, dormScore: newScore });
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, dormScore: newScore })
      );
    }

    const diff = newScore - student.dormScore;
    toast.success(
      `${student.name}'s score ${diff > 0 ? "increased" : "decreased"} to ${newScore}`
    );
    setShowAdjustModal(false);
    reset();
  };

  const getStudentLogs = (studentId: string) => {
    return scoreLogs.filter((log) => log.studentId === studentId);
  };

  const getCurrentStudentLogs = () => {
    if (!user) return [];
    if (isManager) return scoreLogs;
    return scoreLogs.filter((log) => log.studentId === user.id);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentUserScore = isManager
    ? students.find((s) => s.id === user.id)?.dormScore ?? user.dormScore
    : user.dormScore;

  const currentLogs = getCurrentStudentLogs();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1>Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s your dormitory overview
            </p>
          </div>
          <Badge variant={isManager ? "default" : "secondary"} className="text-sm">
            {isManager ? (
              <Shield className="w-3 h-3 mr-1" />
            ) : (
              <User className="w-3 h-3 mr-1" />
            )}
            {isManager ? "Manager" : "Student"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3>Profile Details</h3>
                <p className="text-sm text-muted-foreground">
                  Your information
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">
                  {isManager ? "Manager ID" : "Student ID"}
                </span>
                <span>{user.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Name</span>
                <span>{user.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Room Number</span>
                <span>{user.room}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Building</span>
                <span>Building A</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3>Dorm Score</h3>
                <p className="text-sm text-muted-foreground">
                  Your current rating
                </p>
              </div>
            </div>
            {isManager && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdjustModal(true)}
              >
                Adjust Score
              </Button>
            )}
          </div>
          <div className="text-center py-4">
            <div className={`text-5xl mb-2 ${getScoreColor(currentUserScore)}`}>
              {currentUserScore}
            </div>
            <div className="text-lg mb-3">
              {getScoreRating(currentUserScore)}
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 mb-4">
              <div
                className="bg-primary h-2.5 rounded-full transition-all"
                style={{ width: `${currentUserScore}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Score is based on cleanliness inspections, rule compliance, and
              community participation
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3>Quick Stats</h3>
                <p className="text-sm text-muted-foreground">This month</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Maintenance Requests</span>
                </div>
                <span className="text-lg">3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Documents</span>
                </div>
                <span className="text-lg">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Days Remaining</span>
                </div>
                <span className="text-lg">248</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score History */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2>Score History</h2>
          {currentLogs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogModal(true)}
            >
              View All ({currentLogs.length})
            </Button>
          )}
        </div>

        {currentLogs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No score changes yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentLogs.slice(0, 3).map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          log.newScore >= log.previousScore
                            ? "bg-green-500/10"
                            : "bg-destructive/10"
                        }`}
                      >
                        {log.newScore >= log.previousScore ? (
                          <TrendingUpIcon className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {isManager ? log.studentName : "Score Changed"}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              log.newScore >= log.previousScore
                                ? "text-green-600"
                                : "text-destructive"
                            }
                          >
                            {log.newScore >= log.previousScore ? "+" : ""}
                            {log.newScore - log.previousScore}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {log.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {log.previousScore}
                        </span>
                        <span>→</span>
                        <span className={`font-medium ${getScoreColor(log.newScore)}`}>
                          {log.newScore}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/maintenance"
            className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Wrench className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-1">Maintenance</h3>
                <p className="text-sm text-muted-foreground">
                  Submit and track requests
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/files"
            className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="mb-1">My Files</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your documents
                </p>
              </div>
            </div>
          </Link>

          <div className="group bg-card border border-border rounded-xl p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="mb-1">Events</h3>
                <p className="text-sm text-muted-foreground">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adjust Score Modal (Manager Only) */}
      <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Student Score</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleAdjustScore)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student</Label>
              <select
                id="studentId"
                {...register("studentId", { required: "Student is required" })}
                className="w-full px-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) - Room {s.room} - Score: {s.dormScore}
                  </option>
                ))}
              </select>
              {errors.studentId && (
                <div className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.studentId.message}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="score">New Score (0-100)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                {...register("score", {
                  required: "Score is required",
                  min: { value: 0, message: "Minimum score is 0" },
                  max: { value: 100, message: "Maximum score is 100" },
                })}
                placeholder="Enter new score"
              />
              {errors.score && (
                <div className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.score.message}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                {...register("reason", { required: "Reason is required" })}
                rows={3}
                placeholder="Explain why the score is being adjusted..."
              />
              {errors.reason && (
                <div className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.reason.message}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAdjustModal(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save Change</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Full Score History Modal */}
      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Score History</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {currentLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isManager && (
                      <span className="font-medium text-sm">
                        {log.studentName}
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        log.newScore >= log.previousScore
                          ? "text-green-600"
                          : "text-destructive"
                      }
                    >
                      {log.newScore >= log.previousScore ? "+" : ""}
                      {log.newScore - log.previousScore}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="text-muted-foreground">
                    {log.previousScore}
                  </span>
                  <span>→</span>
                  <span className={`font-medium ${getScoreColor(log.newScore)}`}>
                    {log.newScore}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{log.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  By: {log.changedBy}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
