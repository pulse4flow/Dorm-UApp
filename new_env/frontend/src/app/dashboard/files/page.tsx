"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  File,
  Send,
  AlertCircle,
  X,
  CheckCircle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type FileStatus = "post" | "pending" | "complete";

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  fileName: string;
  fileSize: string;
  note: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

interface AssignedFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date;
  type: string;
  deadline: Date | null;
  status: FileStatus;
  submission?: Submission;
}

interface UploadFormData {
  deadline: string;
}

interface SubmitFormData {
  note: string;
}

const statusConfig: Record<FileStatus, { label: string; color: string; icon: typeof Clock }> = {
  post: { label: "Post", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: FileText },
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  complete: { label: "Complete", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle },
};

export default function FilesPage() {
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<AssignedFile[]>([
    {
      id: "1",
      name: "Dorm Contract 2026.pdf",
      size: "245 KB",
      uploadedAt: new Date(2026, 0, 15),
      type: "application/pdf",
      deadline: new Date(2026, 0, 31),
      status: "pending",
      submission: {
        id: "s1",
        studentId: "STU-042",
        studentName: "John Doe",
        fileName: "Signed_Contract_JohnDoe.pdf",
        fileSize: "280 KB",
        note: "Signed and ready for review",
        submittedAt: new Date(2026, 0, 22),
      },
    },
    {
      id: "2",
      name: "Room Inspection Checklist.pdf",
      size: "128 KB",
      uploadedAt: new Date(2026, 3, 10),
      type: "application/pdf",
      deadline: new Date(2026, 3, 25),
      status: "post",
    },
    {
      id: "3",
      name: "Dormitory Rules & Regulations.pdf",
      size: "89 KB",
      uploadedAt: new Date(2026, 5, 1),
      type: "application/pdf",
      deadline: new Date(2026, 5, 10),
      status: "complete",
      submission: {
        id: "s3",
        studentId: "STU-042",
        studentName: "John Doe",
        fileName: "Rules_Acknowledgement.pdf",
        fileSize: "45 KB",
        note: "I have read and agree to the rules",
        submittedAt: new Date(2026, 5, 5),
        reviewedAt: new Date(2026, 5, 6),
      },
    },
  ]);

  const [activeTab, setActiveTab] = useState<FileStatus | "all">("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<AssignedFile | null>(null);
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const {
    register: registerUpload,
    handleSubmit: handleSubmitUpload,
    formState: { errors: uploadErrors },
    reset: resetUpload,
  } = useForm<UploadFormData>();

  const {
    register: registerSubmit,
    handleSubmit: handleSubmitSubmit,
    reset: resetSubmit,
  } = useForm<SubmitFormData>();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const isManager = user?.role === "manager";

  const handleManagerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleManagerUploadSubmit = (data: UploadFormData) => {
    if (!uploadFile) return;

    const newFile: AssignedFile = {
      id: Date.now().toString(),
      name: uploadFile.name,
      size: `${Math.round(uploadFile.size / 1024)} KB`,
      uploadedAt: new Date(),
      type: uploadFile.type,
      deadline: data.deadline ? new Date(data.deadline) : null,
      status: "post",
    };

    setFiles([newFile, ...files]);
    toast.success("File posted for students");
    setShowUploadModal(false);
    setUploadFile(null);
    resetUpload();
  };

  const handleDownload = (fileName: string) => {
    toast.success(`Downloading ${fileName}`);
  };

  const handleDelete = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
    toast.success("File deleted");
  };

  const handleStudentSubmit = (data: SubmitFormData) => {
    if (!submitFile || !showSubmitModal || !user) return;

    const newSubmission: Submission = {
      id: Date.now().toString(),
      studentId: user.id,
      studentName: user.name,
      fileName: submitFile.name,
      fileSize: `${Math.round(submitFile.size / 1024)} KB`,
      note: data.note,
      submittedAt: new Date(),
    };

    setFiles(
      files.map((f) =>
        f.id === showSubmitModal.id
          ? { ...f, status: "pending" as FileStatus, submission: newSubmission }
          : f
      )
    );

    toast.success(`Submitted "${submitFile.name}" successfully`);
    setShowSubmitModal(null);
    setSubmitFile(null);
    resetSubmit();
  };

  const handleMarkComplete = (fileId: string) => {
    setFiles(
      files.map((f) =>
        f.id === fileId
          ? {
              ...f,
              status: "complete" as FileStatus,
              submission: f.submission
                ? { ...f.submission, reviewedAt: new Date() }
                : undefined,
            }
          : f
      )
    );
    toast.success("Marked as complete");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getDeadlineStatus = (deadline: Date | null) => {
    if (!deadline) return null;
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { label: "Overdue", color: "text-destructive", urgent: true };
    if (daysLeft <= 3) return { label: `${daysLeft} day(s) left`, color: "text-destructive", urgent: true };
    if (daysLeft <= 7) return { label: `${daysLeft} days left`, color: "text-yellow-600", urgent: false };
    return { label: `${daysLeft} days left`, color: "text-muted-foreground", urgent: false };
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("word") || type.includes("document")) return "📝";
    return "📎";
  };

  const filteredFiles = activeTab === "all" ? files : files.filter((f) => f.status === activeTab);

  const tabCounts = {
    all: files.length,
    post: files.filter((f) => f.status === "post").length,
    pending: files.filter((f) => f.status === "pending").length,
    complete: files.filter((f) => f.status === "complete").length,
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1>Files</h1>
            <p className="text-muted-foreground mt-1">
              {isManager
                ? "Post files, review submissions, and track progress"
                : "View assigned files, submit your work, and track status"}
            </p>
          </div>
          {isManager && (
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-5 h-5" />
              Post File
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl mb-1 text-blue-600">{tabCounts.post}</div>
              <div className="text-sm text-muted-foreground">Post</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl mb-1 text-yellow-600">{tabCounts.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl mb-1 text-green-600">{tabCounts.complete}</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mb-6">
          {(["all", "post", "pending", "complete"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveTab(tab)}
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <Badge variant="secondary" className="ml-2 text-xs">
                {tabCounts[tab]}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="mb-2">No files in this category</h3>
          <p className="text-muted-foreground">
            {isManager
              ? "Post a file to get started"
              : "Check back later for assigned files"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFiles.map((file) => {
            const isExpanded = expandedFile === file.id;
            const deadlineStatus = getDeadlineStatus(file.deadline);
            const isOverdue = file.deadline && new Date() > file.deadline;
            const canSubmit =
              !isManager &&
              file.status === "post" &&
              !file.submission;

            return (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getFileIcon(file.type)}</div>
                      <div>
                        <h3 className="font-medium">{file.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>{formatDate(file.uploadedAt)}</span>
                          {file.deadline && (
                            <>
                              <span>•</span>
                              <span className={`flex items-center gap-1 ${deadlineStatus?.color}`}>
                                <Calendar className="w-3 h-3" />
                                Due {formatDate(file.deadline)}
                                {deadlineStatus?.urgent && (
                                  <span className="text-destructive font-medium">
                                    ({deadlineStatus.label})
                                  </span>
                                )}
                                {!deadlineStatus?.urgent && deadlineStatus && (
                                  <span>({deadlineStatus.label})</span>
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Badge
                      className={`${statusConfig[file.status].color} border-0`}
                    >
                      {(() => {
                        const Icon = statusConfig[file.status].icon;
                        return <Icon className="w-3 h-3 mr-1" />;
                      })()}
                      {statusConfig[file.status].label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(file.name)}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>

                    {canSubmit && (
                      <Button
                        size="sm"
                        onClick={() => setShowSubmitModal(file)}
                        disabled={!!isOverdue}
                      >
                        <Upload className="w-4 h-4" />
                        {isOverdue ? "Deadline Passed" : "Submit Work"}
                      </Button>
                    )}

                    {isManager && file.status === "pending" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleMarkComplete(file.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Complete
                      </Button>
                    )}

                    {isManager && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedFile(isExpanded ? null : file.id)
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Student: submission details */}
                  {!isManager && file.submission && (
                    <div
                      className={`mt-4 p-4 rounded-lg border ${
                        file.status === "complete"
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-yellow-500/5 border-yellow-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {file.status === "complete" ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                          <span className="text-sm font-medium">
                            {file.status === "complete"
                              ? "Reviewed by Manager"
                              : "Waiting for Review"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(file.submission.submittedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <File className="w-4 h-4" />
                        <span>{file.submission.fileName}</span>
                        <span>•</span>
                        <span>{file.submission.fileSize}</span>
                      </div>
                      {file.submission.note && (
                        <p className="text-sm mt-2 text-muted-foreground italic">
                          &ldquo;{file.submission.note}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Manager: expanded details */}
                  {isManager && isExpanded && (
                    <div className="mt-4 border-t border-border pt-4 space-y-3">
                      {file.submission ? (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {file.submission.studentName}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {file.submission.studentId}
                              </Badge>
                              <Badge
                                variant={file.status === "complete" ? "default" : "secondary"}
                                className={
                                  file.status === "complete"
                                    ? "bg-green-600 text-white"
                                    : "text-yellow-600"
                                }
                              >
                                {file.status === "complete" ? "Reviewed" : "Submitted"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {file.submission.fileName} • {file.submission.fileSize} •{" "}
                            Submitted {formatDateTime(file.submission.submittedAt)}
                          </div>
                          {file.submission.reviewedAt && (
                            <div className="text-xs text-green-600 mt-1">
                              Reviewed {formatDateTime(file.submission.reviewedAt)}
                            </div>
                          )}
                          {file.submission.note && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              &ldquo;{file.submission.note}&rdquo;
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(file.submission!.fileName)}
                            >
                              <Download className="w-4 h-4" />
                              Download Submission
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No submission yet
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Manager Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post File for Students</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmitUpload(handleManagerUploadSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>File</Label>
              {!uploadFile ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to select file
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </span>
                  <input
                    type="file"
                    onChange={handleManagerUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <File className="w-6 h-6 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{uploadFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(uploadFile.size / 1024)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadFile(null)}
                    className="p-1 hover:bg-background rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (optional)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                {...registerUpload("deadline")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  resetUpload();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!uploadFile}>
                Post File
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Submit Modal */}
      <Dialog
        open={!!showSubmitModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowSubmitModal(null);
            setSubmitFile(null);
            resetSubmit();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Work</DialogTitle>
          </DialogHeader>

          {showSubmitModal && (
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg mb-4">
              <div className="text-2xl">{getFileIcon(showSubmitModal.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{showSubmitModal.name}</p>
                <p className="text-sm text-muted-foreground">
                  {showSubmitModal.size}
                </p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmitSubmit(handleStudentSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Your File</Label>
              {!submitFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload your work
                  </span>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSubmitFile(file);
                    }}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <File className="w-6 h-6 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{submitFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(submitFile.size / 1024)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitFile(null)}
                    className="p-1 hover:bg-background rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="submitNote">Note (optional)</Label>
              <Textarea
                id="submitNote"
                {...registerSubmit("note")}
                rows={3}
                placeholder="Add a note for the manager..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowSubmitModal(null);
                  setSubmitFile(null);
                  resetSubmit();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!submitFile}>
                <Send className="w-4 h-4" />
                Submit Work
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
