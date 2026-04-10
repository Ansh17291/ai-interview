"use client";

import { useState } from "react";
import { analyzeJobDescription, JDAnalysis } from "@/lib/actions/jd.action";
import { toast } from "sonner";
import { Loader2, Zap, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Agent from "@/components/Agent";

interface JDSynchronizerProps {
  userId: string;
  userName: string;
}

export default function JDSynchronizer({ userId, userName }: JDSynchronizerProps) {
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JDAnalysis | null>(null);
  const [mode, setMode] = useState<"input" | "preview" | "interview">("input");

  const handleAnalyze = async () => {
    if (!jdText || jdText.trim().length < 50) {
      toast.error("Please provide a more detailed job description.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeJobDescription(jdText);
      if (result.success && result.data) {
        setAnalysis(result.data);
        setMode("preview");
        toast.success("Job description analyzed successfully!");
      } else {
        toast.error(result.error || "Failed to analyze the job description.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (mode === "interview" && analysis) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="bg-primary-100/10 border border-primary-100/20 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-100 font-medium">Interviewing for:</p>
            <h2 className="text-xl font-bold text-light-100">{analysis.role} {analysis.company ? `@ ${analysis.company}` : ""}</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setMode("preview")} className="border-light-400/20 text-light-200">
            Back to Details
          </Button>
        </div>
        
        <Agent
          userName={userName}
          userId={userId}
          type="interview"
          interviewId="custom_jd_interview" // We'll handle this in the feedback action
          role={analysis.role}
          level={analysis.level}
          techStack={analysis.primarySkills}
          questions={analysis.likelyQuestions}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-light-100 sm:text-4xl">
          JD <span className="text-primary-100">Synchronizer</span>
        </h1>
        <p className="text-light-200 max-w-2xl mx-auto">
          Paste the job description you're applying for, and our AI will customize your mock interview to match exactly what recruiters are looking for.
        </p>
      </div>

      {mode === "input" ? (
        <div className="bg-dark-200 border border-light-400/10 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-light-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-100" />
              Paste Job Description
            </label>
            <Textarea
              placeholder="Paste the full job description here (Role, Requirements, Responsibilities...)"
              className="min-h-[300px] bg-dark-300 border-light-400/10 focus:border-primary-100/50 text-light-100 placeholder:text-light-400/50 rounded-xl transition-all"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || jdText.length < 50}
            className="w-full bg-primary-100 hover:bg-primary-200 text-dark-100 font-bold py-6 rounded-xl transition-all shadow-lg shadow-primary-100/20"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing with Gemini...
              </>
            ) : (
              <>
                Sync with Interviewer
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      ) : (
        analysis && (
          <div className="animate-in zoom-in-95 duration-300 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Role Overview */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-dark-200 border border-light-400/10 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-light-100">{analysis.role}</h2>
                      <p className="text-primary-100 font-medium">{analysis.company || "Target Company"}</p>
                    </div>
                    <span className="bg-primary-100/10 text-primary-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {analysis.level}
                    </span>
                  </div>
                  
                  <p className="text-light-200 text-sm leading-relaxed">
                    {analysis.briefSummary}
                  </p>

                  <div className="pt-4 border-t border-light-400/10">
                    <h4 className="text-sm font-semibold text-light-100 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Key Skills to Highlight
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.primarySkills.map((skill, index) => (
                        <span key={index} className="bg-dark-300 border border-light-400/10 text-light-100 px-3 py-1 rounded-lg text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-dark-200 border border-light-400/10 rounded-2xl p-6 shadow-xl">
                  <h4 className="text-sm font-semibold text-light-100 mb-4 flex items-center gap-2">
                     Likely Interview Questions
                  </h4>
                  <div className="space-y-3">
                    {analysis.likelyQuestions.map((q, index) => (
                      <div key={index} className="bg-dark-300/50 p-3 rounded-lg border border-light-400/5 text-sm text-light-200">
                        {index + 1}. {q}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Actions & Soft Skills */}
              <div className="space-y-6">
                <div className="bg-dark-200 border border-light-400/10 rounded-2xl p-6 shadow-xl space-y-4">
                  <h4 className="text-sm font-semibold text-light-100">Soft Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.softSkills.map((skill, index) => (
                      <span key={index} className="bg-primary-100/5 text-primary-200 border border-primary-100/20 px-3 py-1 rounded-lg text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {analysis.companyValues && analysis.companyValues.length > 0 && (
                  <div className="bg-dark-200 border border-light-400/10 rounded-2xl p-6 shadow-xl space-y-4">
                    <h4 className="text-sm font-semibold text-light-100">Culture Match</h4>
                    <ul className="space-y-2">
                      {analysis.companyValues.map((val, index) => (
                        <li key={index} className="text-xs text-light-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-primary-100 mt-0.5" />
                          {val}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 flex flex-col gap-3">
                  <Button 
                    onClick={() => setMode("interview")}
                    className="w-full bg-primary-100 hover:bg-primary-200 text-dark-100 font-bold py-6 rounded-xl transition-all shadow-lg"
                  >
                    Start Specialized Interview
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setMode("input")}
                    className="text-light-400 hover:text-light-100"
                  >
                    Resync with new JD
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
