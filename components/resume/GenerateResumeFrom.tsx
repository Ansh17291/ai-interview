"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Github, CheckCircle2 } from "lucide-react";
import FormField from "@/components/FormField";

interface GenerateResumeProps {
  userId: string;
  userEmail: string;
  userFullName: string;
  techSummary?: any;
  onSuccess: (resumeId: string) => void;
  onCancel: () => void;
}

export function GenerateResumeFrom({
  userId,
  userEmail,
  userFullName,
  techSummary,
  onSuccess,
  onCancel,
}: GenerateResumeProps) {
  const [loading, setLoading] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [location, setLocation] = useState("");
  const [step, setStep] = useState<"input" | "generating" | "success">("input");
  const [generatedResumeId, setGeneratedResumeId] = useState<string>("");

  const handleGenerate = async () => {
    if (!githubUsername && !techSummary?.topAreas) {
      toast.error(
        "We need either your GitHub username or your interview/quiz history to generate a resume"
      );
      return;
    }

    setLoading(true);
    setStep("generating");

    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fullName: userFullName,
          email: userEmail,
          location: location || undefined,
          githubUsername: githubUsername || undefined,
          linkedInUrl: linkedInUrl || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate resume");
      }

      const result = await response.json();

      if (result.success) {
        setGeneratedResumeId(result.resumeId);
        setStep("success");
        toast.success("Resume generated successfully!");

        // Redirect after 2 seconds
        setTimeout(() => {
          onSuccess(result.resumeId);
        }, 2000);
      }
    } catch (error) {
      setStep("input");
      toast.error(
        error instanceof Error ? error.message : "Failed to generate resume"
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-success-100/10 border border-success-100/30 rounded-lg text-center">
          <CheckCircle2 className="w-12 h-12 text-success-100 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-light-100 mb-2">
            Resume Generated! 🎉
          </h3>
          <p className="text-light-400 text-sm mb-4">
            Your resume has been created from your recent interview performance, 
            improvement points, and technical assessments.
            {"\n"}Check the <strong>AI Insights</strong> tab to see your profile analysis!
          </p>
          <div className="flex gap-2 justify-center">
            <Button disabled size="sm">
              Redirecting...
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="space-y-4 text-center py-8">
        <Loader2 className="w-12 h-12 text-primary-100 mx-auto animate-spin" />
        <h3 className="text-lg font-semibold text-light-100">
          Generating your resume...
        </h3>
        <p className="text-light-400 text-sm">
          We're analyzing your interview performance, technical feedback, and projects to create a data-driven resume.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tech Summary */}
      {techSummary && (
        <div className="p-4 bg-dark-300/50 border border-primary-100/20 rounded-lg">
          <h3 className="text-sm font-semibold text-light-100 mb-3">
            We found your technical experience:
          </h3>
          <div className="flex flex-wrap gap-2">
            {techSummary.topAreas?.slice(0, 6).map((tech: string) => (
              <span
                key={tech}
                className="px-3 py-1 bg-primary-100/10 border border-primary-100/30 rounded-full text-xs text-primary-100"
              >
                {tech}
              </span>
            ))}
          </div>
          <p className="text-xs text-light-400 mt-3">
            From {techSummary.interviewCount} interviews and{" "}
            {techSummary.quizCount} quizzes
          </p>
        </div>
      )}

      {/* Optional GitHub username */}
      <div className="space-y-3">
        <label className="text-light-100 font-semibold text-sm flex items-center gap-2">
          <Github className="w-4 h-4" />
          GitHub Username (Optional)
        </label>
        <input
          type="text"
          value={githubUsername}
          onChange={(e) => setGithubUsername(e.target.value)}
          placeholder="e.g., octocat"
          disabled={loading}
          className="w-full px-4 py-2 bg-dark-200 border border-light-400/20 rounded-lg text-light-100 placeholder-light-400 focus:border-primary-100 focus:outline-none"
        />
        <p className="text-xs text-light-400">
          If provided, we'll include your GitHub projects and technologies
        </p>
      </div>

      {/* LinkedIn URL */}
      <div className="space-y-3">
        <label className="text-light-100 font-semibold text-sm flex items-center gap-2">
          <span className="text-primary-100 font-bold">in</span>
          LinkedIn Profile (Optional)
        </label>
        <input
          type="text"
          value={linkedInUrl}
          onChange={(e) => setLinkedInUrl(e.target.value)}
          placeholder="e.g., https://linkedin.com/in/ansh"
          disabled={loading}
          className="w-full px-4 py-2 bg-dark-200 border border-light-400/20 rounded-lg text-light-100 placeholder-light-400 focus:border-primary-100 focus:outline-none"
        />
      </div>

      {/* Location */}
      <div className="space-y-3">
        <label className="text-light-100 font-semibold text-sm">
          Location (Optional)
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., San Francisco, CA"
          disabled={loading}
          className="w-full px-4 py-2 bg-dark-200 border border-light-400/20 rounded-lg text-light-100 placeholder-light-400 focus:border-primary-100 focus:outline-none"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={loading || (!githubUsername && !techSummary?.topAreas)}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Generate Resume
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>

      <div className="p-3 bg-dark-300/50 border border-light-400/10 rounded-lg text-xs text-light-400">
        <strong>What we'll include:</strong> Your interview topics and
        performance, technical skills from quizzes{githubUsername && ", GitHub projects and technologies"}
      </div>
    </div>
  );
}
