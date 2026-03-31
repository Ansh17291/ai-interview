"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Target, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { optimizeResumeForRole } from "@/lib/actions/resumeOptimizer.action";
import { useRouter } from "next/navigation";

interface ResumeOptimizerProps {
  resumeId: string;
  resumeTitle: string;
  onSuccess?: (newResumeId: string) => void;
  onCancel?: () => void;
}

export function ResumeOptimizer({ 
  resumeId, 
  resumeTitle, 
  onSuccess, 
  onCancel 
}: ResumeOptimizerProps) {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const handleOptimize = async () => {
    if (!targetRole || !jobDescription) {
      toast.error("Please provide both target role and job description");
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await optimizeResumeForRole(resumeId, targetRole, jobDescription);
      
      if (result.success) {
        setOptimizationResult(result.analysis);
        toast.success("Resume optimized successfully!");
        if (onSuccess && result.id) {
          setTimeout(() => onSuccess(result.id!), 2000);
        }
      } else {
        toast.error(result.error || "Optimization failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsOptimizing(false);
    }
  };

  if (optimizationResult) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
             <CheckCircle2 className="w-10 h-10 text-green-600" />
           </div>
           <h2 className="text-2xl font-bold text-light-100">Optimization Complete!</h2>
           <p className="text-light-400">We&apos;ve created a new optimized version of your resume.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-200 p-6 rounded-xl border border-light-400/10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-100" />
              <h3 className="font-bold text-white uppercase text-xs tracking-widest">ATS Match Score</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-primary-100">{optimizationResult.scoreAfter}</span>
              <span className="text-light-400 mb-2">/ 100</span>
            </div>
            <p className="text-xs text-light-400 mt-2">
              Improved from {optimizationResult.scoreBefore}% match.
            </p>
          </div>

          <div className="bg-dark-200 p-6 rounded-xl border border-light-400/10">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-green-400" />
              <h3 className="font-bold text-white uppercase text-xs tracking-widest">Keywords Matched</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {optimizationResult.matchedKeywords.slice(0, 8).map((kw: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded border border-green-800/30">
                  {kw}
                </span>
              ))}
              {optimizationResult.matchedKeywords.length > 8 && (
                <span className="text-xs text-light-400 pt-1">+{optimizationResult.matchedKeywords.length - 8} more</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-primary-100/5 p-6 rounded-xl border border-primary-100/20">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-100" />
            Key Improvements Made:
          </h4>
          <ul className="space-y-2">
            {optimizationResult.improvements.map((imp: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-light-200">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-100 mt-1.5 flex-shrink-0" />
                {imp}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          <Button 
            className="w-full bg-primary-100 hover:bg-primary-200 text-dark-400 font-bold h-12"
            onClick={() => router.push(`/resume`)}
          >
            View My Resumes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Target className="w-8 h-8 text-primary-100" />
        <div>
          <h2 className="text-2xl font-bold text-light-100 italic">Resume Optimizer</h2>
          <p className="text-light-400 text-sm">Target a specific role to increase your hiring chances</p>
        </div>
      </div>

      <div className="bg-dark-200/50 p-4 rounded-lg border border-light-400/10 mb-6 flex items-center gap-3">
        <FileText className="w-5 h-5 text-light-400" />
        <span className="text-light-200">Optimizing: <strong className="text-white">{resumeTitle}</strong></span>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role" className="text-light-100 font-bold">Target Job Role</Label>
          <Input 
            id="role"
            placeholder="e.g. Senior Frontend Developer" 
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="bg-dark-400 border-light-400/20 focus:border-primary-100 h-12 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jd" className="text-light-100 font-bold">Job Description</Label>
          <Textarea 
            id="jd"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="bg-dark-400 border-light-400/20 focus:border-primary-100 min-h-[200px] text-white"
          />
          <p className="text-[10px] text-light-400 text-right">The more detail, the better the optimization.</p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button 
            onClick={handleOptimize}
            disabled={isOptimizing || !targetRole || !jobDescription}
            className="w-full bg-primary-100 hover:bg-primary-200 text-dark-400 font-bold h-14 text-lg shadow-lg shadow-primary-100/10"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                AI is optimizing...
              </>
            ) : (
              <>
                Optimize for Role
                <Sparkles className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={onCancel}
            disabled={isOptimizing}
            className="text-light-400 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="p-4 bg-primary-100/5 rounded-xl border border-primary-100/10 flex gap-3">
        <AlertCircle className="w-5 h-5 text-primary-100 shrink-0" />
        <p className="text-xs text-light-300 leading-relaxed">
          <strong>How it works:</strong> Our AI analyzes the job description against your resume, 
          identifies missing technical keywords, and rewrites your summary and experience 
          to highlight relevant achievements. This can increase ATS scores by up to 60%.
        </p>
      </div>
    </div>
  );
}
