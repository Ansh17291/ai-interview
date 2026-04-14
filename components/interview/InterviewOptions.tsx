"use client";

import { useState } from "react";
import { dummyInterviews } from "@/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronRight, User, Terminal, Layout, Server, Database, Smartphone } from "lucide-react";
import Agent from "@/components/Agent";



interface InterviewOptionsProps {
  userId: string;
  userName: string;
}

const roleIcons: Record<string, any> = {
  "Frontend Developer": Layout,
  "Backend Developer": Server,
  "Full Stack Developer": Terminal,
  "Mobile Developer": Smartphone,
  "DevOps Engineer": Database,
  "Product Manager": User,
};

export default function InterviewOptions({ userId, userName }: InterviewOptionsProps) {
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);

  const startCustomInterview = () => {
    setSelectedInterview({
      id: "custom",
      role: "Custom Role",
      level: "Candidate",
      type: "Custom",
      techstack: ["Any"],
      questions: [
        "Please ask me what role I am interviewing for today and what my technical background is, and then proceed with the interview based on my response.",
      ],
    });
  };

  if (selectedInterview) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="bg-primary-100/10 border border-primary-100/20 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-100 font-medium">Interviewing for:</p>
            <h2 className="text-xl font-bold text-light-100">{selectedInterview.role}</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelectedInterview(null)} className="border-light-400/20 text-light-200">
            Change Role
          </Button>
        </div>
        
        <Agent
          userName={userName}
          userId={userId}
          type="interview"
          interviewId={selectedInterview.id === "custom" ? `custom_${Date.now()}` : `predefined_${selectedInterview.id}`}
          role={selectedInterview.role}
          level={selectedInterview.level}
          techStack={selectedInterview.techstack}
          questions={selectedInterview.questions}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-light-100 sm:text-4xl">
          Choose Your <span className="text-primary-100">Interview Path</span>
        </h1>
        <p className="text-light-200 max-w-2xl mx-auto">
          Select a role to start a specialized mock interview. Our AI will challenge you with industry-standard questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {dummyInterviews.filter(i => i.id !== "user-1").map((interview) => {
          const Icon = roleIcons[interview.role] || Terminal;
          return (
            <Card 
              key={interview.id} 
              className="bg-dark-200 border-light-400/10 hover:border-primary-100/30 transition-all duration-300 group cursor-pointer overflow-hidden p-0"
              onClick={() => setSelectedInterview(interview)}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary-100/10 flex items-center justify-center text-primary-100 group-hover:bg-primary-100 group-hover:text-dark-100 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="bg-primary-100/10 text-primary-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-primary-100/20">
                    {interview.level}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-light-100 group-hover:text-primary-100 transition-colors">
                    {interview.role}
                  </h3>
                  <p className="text-sm text-light-300 mt-1 line-clamp-1">
                    {interview.type} Interview
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {interview.techstack?.slice(0, 3).map((tech: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-dark-300 text-light-200 px-2 py-1 rounded border border-light-400/5">
                      {tech}
                    </span>
                  ))}
                  {(interview.techstack?.length ?? 0) > 3 && (
                    <span className="text-[10px] text-light-400 self-center">
                      +{(interview.techstack?.length ?? 0) - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-dark-300/50 p-4 border-t border-light-400/5 flex items-center justify-between group-hover:bg-primary-100/5 transition-colors">
                <span className="text-xs font-semibold text-light-400 flex items-center gap-1 group-hover:text-primary-100">
                  <Zap className="w-3 h-3" />
                  {interview.questions?.length} Questions
                </span>
                <ChevronRight className="w-4 h-4 text-light-400 group-hover:text-primary-100 group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          );
        })}

        {/* Custom Role Option */}
        <Card 
          className="bg-primary-100/5 border-primary-100/20 hover:border-primary-100/50 transition-all duration-300 group cursor-pointer overflow-hidden p-0"
          onClick={startCustomInterview}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-dark-100 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 fill-dark-100" />
              </div>
              <div className="bg-primary-100/20 text-primary-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-primary-100/30">
                Any Role
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-light-100">
                Other / Custom Role
              </h3>
              <p className="text-sm text-light-300 mt-1">
                Start a conversation and tell the AI your desired role
              </p>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-primary-100 font-semibold group-hover:underline">
                Quick Start Interaction →
              </span>
            </div>
          </div>
          
          <div className="bg-primary-100/10 p-4 border-t border-primary-100/10 flex items-center justify-between">
            <span className="text-xs font-bold text-primary-100">
              Direct Access
            </span>
            <ChevronRight className="w-4 h-4 text-primary-100 group-hover:translate-x-1 transition-all" />
          </div>
        </Card>
      </div>
    </div>
  );
}
