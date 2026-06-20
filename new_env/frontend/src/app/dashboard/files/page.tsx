"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  File,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface FileItem {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date;
  type: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Dorm Contract 2026.pdf",
      size: "245 KB",
      uploadedAt: new Date(2026, 0, 15),
      type: "application/pdf",
    },
    {
      id: "2",
      name: "Room Inspection Report.pdf",
      size: "128 KB",
      uploadedAt: new Date(2026, 3, 10),
      type: "application/pdf",
    },
  ]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUpload = () => {
    if (!uploadFile) return;

    const newFile: FileItem = {
      id: Date.now().toString(),
      name: uploadFile.name,
      size: `${Math.round(uploadFile.size / 1024)} KB`,
      uploadedAt: new Date(),
      type: uploadFile.type,
    };

    setFiles([newFile, ...files]);
    toast.success("File uploaded successfully");
    setShowUploadModal(false);
    setUploadFile(null);
  };

  const handleDownload = (file: FileItem) => {
    toast.success(`Downloading ${file.name}`);
  };

  const handleDelete = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
    toast.success("File deleted");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    if (type.includes("word") || type.includes("document")) return "📝";
    return "📎";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1>My Files</h1>
            <p className="text-muted-foreground mt-1">
              Upload and manage your dormitory documents
            </p>
          </div>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="w-5 h-5" />
            Upload File
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-1">{files.length}</div>
                <div className="text-sm text-muted-foreground">
                  Total Files
                </div>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="mb-2">No files uploaded</h3>
          <p className="text-muted-foreground mb-6">
            Upload your first document to get started
          </p>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="w-5 h-5" />
            Upload File
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{getFileIcon(file.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate mb-1">{file.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {file.size}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-4">
                  Uploaded {formatDate(file.uploadedAt)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!uploadFile ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                <span className="text-sm text-muted-foreground mb-1">
                  Click to select file
                </span>
                <span className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </span>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <File className="w-8 h-8 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{uploadFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(uploadFile.size / 1024)} KB
                  </p>
                </div>
                <button
                  onClick={() => setUploadFile(null)}
                  className="p-1 hover:bg-background rounded transition-colors"
                >
                  <span className="text-muted-foreground">✕</span>
                </button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowUploadModal(false);
                setUploadFile(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!uploadFile}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
