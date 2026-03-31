"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getUserTechSummary } from "@/lib/services/dataAggregator";
import { ResumeStartOptions } from "@/components/resume/ResumeStartOptions";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { GenerateResumeFrom } from "@/components/resume/GenerateResumeFrom";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Step = "options" | "upload" | "generate" | "form";

export default function CreateResumePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("options");
  const [user, setUser] = useState<User | null>(null);
  const [techSummary, setTechSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        window.location.href = "/sign-in";
        return;
      }

      setUser(currentUser);

      // Load tech summary for generate option
      const summary = await getUserTechSummary(currentUser.id);
      setTechSummary(summary);

      setLoading(false);
    };

    loadUser();
  }, []);

  const handleResumeCreated = (resumeId: string) => {
    // Redirect to resume edit page
    router.push(`/resume/${resumeId}`);
  };

  const handleCreateForm = () => {
    // For now, redirect to resume form (you can create this later)
    // This would be a form-based resume builder
    router.push("/resume/form");
  };

  if (loading) {
    return <p className="text-light-200 p-10">Loading...</p>;
  }

  if (!user) {
    return <p className="text-light-200 p-10">Redirecting to login...</p>;
  }

  return (
    <div className="min-h-screen bg-dark-400">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/resume"
            className="flex items-center gap-2 text-light-400 hover:text-light-100 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resumes
          </Link>
          <h1 className="text-4xl font-bold text-primary-100 mb-2">
            Create New Resume
          </h1>
          <p className="text-light-300">
            Choose how you'd like to create your resume. We'll help you optimize
            it for any job!
          </p>
        </div>

        {/* Content */}
        <div className="bg-dark-300 border border-light-400/10 rounded-2xl p-8">
          {step === "options" && (
            <ResumeStartOptions
              onUpload={() => setStep("upload")}
              onGenerate={() => setStep("generate")}
              onCreate={handleCreateForm}
              hasInterviews={(techSummary?.interviewCount || 0) > 0}
              hasGithub={!!(techSummary?.techLevels?.length || 0) > 0}
            />
          )}

          {step === "upload" && (
            <>
              <div className="mb-4">
                <button
                  onClick={() => setStep("options")}
                  className="text-light-400 hover:text-light-100 text-sm flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
              <ResumeUploader
                userId={user.id}
                onSuccess={handleResumeCreated}
                onCancel={() => setStep("options")}
              />
            </>
          )}

          {step === "generate" && (
            <>
              <div className="mb-4">
                <button
                  onClick={() => setStep("options")}
                  className="text-light-400 hover:text-light-100 text-sm flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
              <GenerateResumeFrom
                userId={user.id}
                userEmail={user.email}
                userFullName={user.name}
                techSummary={techSummary}
                onSuccess={handleResumeCreated}
                onCancel={() => setStep("options")}
              />
            </>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-dark-300/50 border border-light-400/10 rounded-lg">
          <p className="text-light-400 text-sm">
            <strong>ℹ️ Coming Next:</strong> After creating your resume, you'll
            be able to optimize it for specific job roles. We'll compare it with
            job descriptions and suggest improvements!
          </p>
        </div>
      </div>
    </div>
  );
}
