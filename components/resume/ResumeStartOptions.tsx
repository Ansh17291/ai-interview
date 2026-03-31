"use client";

import { Button } from "@/components/ui/button";
import {
  Upload,
  Sparkles,
  FileText,
  ChevronRight,
} from "lucide-react";

interface ResumeStartOptions {
  onUpload: () => void;
  onGenerate: () => void;
  onCreate: () => void;
  hasInterviews: boolean;
  hasGithub: boolean;
}

export function ResumeStartOptions({
  onUpload,
  onGenerate,
  onCreate,
  hasInterviews,
  hasGithub,
}: ResumeStartOptions) {
  const canGenerate = hasInterviews || hasGithub;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-light-100 mb-6">
        How would you like to create your resume?
      </h2>

      {/* Option 1: Upload */}
      <button
        onClick={onUpload}
        className="w-full p-6 border border-light-400/20 rounded-lg bg-dark-300 hover:bg-dark-200 hover:border-light-400/40 transition-all text-left"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Upload className="w-6 h-6 text-primary-100" />
              <h3 className="text-lg font-semibold text-light-100">
                Upload Existing Resume
              </h3>
            </div>
            <p className="text-light-400 text-sm">
              Upload your current resume (PDF, DOCX, or TXT) to get started
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-light-400 flex-shrink-0" />
        </div>
      </button>

      {/* Option 2: Generate from Data */}
      {canGenerate && (
        <button
          onClick={onGenerate}
          className="w-full p-6 border border-primary-100/20 rounded-lg bg-dark-300 hover:bg-dark-200 hover:border-primary-100/40 transition-all text-left"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-primary-100" />
                <h3 className="text-lg font-semibold text-light-100">
                  Generate from Your Data
                </h3>
              </div>
              <p className="text-light-400 text-sm">
                Create a resume from your interviews, quizzes
                {hasGithub && ", and GitHub profile"}
                . AI-powered!
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-light-400 flex-shrink-0" />
          </div>
        </button>
      )}

      {/* Option 3: Start Fresh */}
      <button
        onClick={onCreate}
        className="w-full p-6 border border-light-400/20 rounded-lg bg-dark-300 hover:bg-dark-200 hover:border-light-400/40 transition-all text-left"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-light-300" />
              <h3 className="text-lg font-semibold text-light-100">
                Create From Scratch
              </h3>
            </div>
            <p className="text-light-400 text-sm">
              Build your resume step-by-step using our resume builder form
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-light-400 flex-shrink-0" />
        </div>
      </button>

      {/* Tips */}
      <div className="p-4 bg-dark-300/50 border border-light-400/10 rounded-lg">
        <p className="text-xs text-light-400">
          <strong>💡 Tip:</strong> Uploading an existing resume or generating
          from your data is faster! After creation, you can optimize it for any
          job role.
        </p>
      </div>
    </div>
  );
}
