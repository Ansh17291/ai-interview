"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";

interface ResumeUploaderProps {
  userId: string;
  onSuccess: (resumeId: string, resume: any) => void;
  onCancel: () => void;
}

export function ResumeUploader({
  userId,
  onSuccess,
  onCancel,
}: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please upload a PDF, DOCX, or TXT file");
      return;
    }

    // Validate file size
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to parse resume");
      }

      const result = await response.json();

      if (result.success) {
        setPreview(result.resume);
        toast.success("Resume parsed successfully!");
        
        // Show preview for 2 seconds then call onSuccess
        setTimeout(() => {
          onSuccess(result.resumeId, result.resume);
        }, 1500);
      } else {
        toast.error(result.error || "Failed to parse resume");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload resume"
      );
    } finally {
      setLoading(false);
    }
  };

  if (preview) {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-success-100/10 border border-success-100/30 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-success-100" />
            <h3 className="text-lg font-semibold text-white">
              Resume Parsed Successfully!
            </h3>
          </div>
          <p className="text-light-300 mb-4">Here's what we extracted:</p>
          <div className="space-y-2 text-light-400 text-sm">
            <p>
              <strong>Name:</strong> {preview.personalInfo?.fullName}
            </p>
            <p>
              <strong>Email:</strong> {preview.personalInfo?.email}
            </p>
            <p>
              <strong>Skills:</strong> {preview.skills?.length || 0} technologies
            </p>
            <p>
              <strong>Experience:</strong> {preview.experience?.length || 0}{" "}
              roles
            </p>
            <p>
              <strong>Education:</strong> {preview.education?.length || 0}{" "}
              entries
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="default" disabled className="flex-1">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-light-400/30 rounded-lg p-8 text-center hover:border-light-400/50 transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.docx,.txt"
          hidden
          disabled={loading}
        />

        {file ? (
          <div className="space-y-3">
            <FileText className="w-12 h-12 text-primary-100 mx-auto" />
            <div>
              <p className="text-light-100 font-semibold">{file.name}</p>
              <p className="text-light-400 text-sm">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              Change File
            </Button>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-light-400 mx-auto mb-3" />
            <p className="text-light-100 font-semibold mb-1">
              Upload your resume
            </p>
            <p className="text-light-400 text-sm mb-4">
              Supported formats: PDF, DOCX, TXT (Max 10MB)
            </p>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Select File
            </Button>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="default"
          onClick={handleUpload}
          disabled={!file || loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Parse Resume
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>

      <p className="text-xs text-light-400">
        💡 We'll extract your contact info, experience, skills, and education.
        You can then optimize it for specific job roles.
      </p>
    </div>
  );
}
