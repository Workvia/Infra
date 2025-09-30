"use client";

import * as React from "react";
import { Upload, File, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  file: File;
  status: "uploading" | "processing" | "completed" | "failed";
  progress: number;
  documentId?: string;
  error?: string;
}

interface DocumentUploadProps {
  clientId: string;
  onUploadComplete?: (documentId: string) => void;
}

export function DocumentUpload({ clientId, onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [documentType, setDocumentType] = React.useState<string>("other");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: "uploading",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Upload each file
    newFiles.forEach((uploadedFile) => {
      uploadFile(uploadedFile);
    });
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    const formData = new FormData();
    formData.append("file", uploadedFile.file);
    formData.append("clientId", clientId);
    formData.append("documentType", documentType);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      // Update status to processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "processing",
                progress: 100,
                documentId: result.documentId,
              }
            : f
        )
      );

      // Poll for extraction completion
      pollExtractionStatus(uploadedFile.id, result.documentId);
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "failed",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
    }
  };

  const pollExtractionStatus = async (fileId: string, documentId: string) => {
    // Poll every 2 seconds for up to 2 minutes
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      attempts++;

      try {
        const response = await fetch(
          `/api/documents/upload?documentId=${documentId}`
        );

        if (!response.ok) {
          throw new Error("Failed to get status");
        }

        const result = await response.json();

        if (result.status === "completed") {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId ? { ...f, status: "completed" } : f
            )
          );

          onUploadComplete?.(documentId);
          return;
        }

        if (result.status === "failed") {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? { ...f, status: "failed", error: "Extraction failed" }
                : f
            )
          );
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        }
      } catch (error) {
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        }
      }
    };

    setTimeout(poll, 2000);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);

    const newFiles: UploadedFile[] = droppedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: "uploading",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((uploadedFile) => {
      uploadFile(uploadedFile);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="carrier_quote">Carrier Quote</SelectItem>
            <SelectItem value="binded_policy">Binded Policy</SelectItem>
            <SelectItem value="dec_page">Declaration Page</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="amendment">Amendment</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Documents
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <Card
        className={cn(
          "border-2 border-dashed p-8",
          "hover:border-primary/50 hover:bg-muted/50 transition-colors"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">
              Drag and drop files here, or click to browse
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Supports PDF, DOC, DOCX, TXT files
            </p>
          </div>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading {files.length} file(s)</h4>

          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {file.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : file.status === "failed" ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {file.status === "uploading" && (
                    <Progress value={file.progress} className="mt-2" />
                  )}

                  {file.status === "processing" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Extracting data...
                    </p>
                  )}

                  {file.status === "completed" && (
                    <p className="text-xs text-green-600 mt-1">
                      Extraction complete
                    </p>
                  )}

                  {file.status === "failed" && (
                    <p className="text-xs text-red-600 mt-1">
                      {file.error || "Upload failed"}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}