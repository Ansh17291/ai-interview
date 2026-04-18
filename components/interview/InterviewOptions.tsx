"use client";

import { useState } from "react";
import { dummyInterviews } from "@/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ChevronRight, User, Terminal, Layout, Server, Database, Smartphone, Globe, ShieldCheck, Target, Sparkles, Rocket } from "lucide-react";
import Agent from "@/components/Agent";
import { cn } from "@/lib/utils";

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
      role: "Digital Executive",
      level: "Elite",
      type: "Custom",
      techstack: ["Universal"],
      questions: [
        "Please ask me what role I am interviewing for today and what my technical background is, and then proceed with the interview based on my response.",
      ],
    });
  };

  if (selectedInterview) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 bg-primary-100/5 blur-3xl rounded-full opacity-50"></div>
          
          <div className="flex items-center gap-6 relative z-10">
             <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center shadow-xl shadow-primary-100/20">
                <Rocket className="w-8 h-8 text-zinc-950" />
             </div>
             <div>
                <p className="text-[10px] font-black text-primary-100 uppercase tracking-widest mb-1">Session Protocol Initialized</p>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">{selectedInterview.role} <span className="text-zinc-600 ml-2">/ {selectedInterview.level}</span></h2>
             </div>
          </div>
          
          <Button variant="outline" onClick={() => setSelectedInterview(null)} className="h-12 px-6 border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl uppercase font-black text-[10px] tracking-widest relative z-10">
            Terminate & Re-select
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
    <div className="w-full max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      
      {/* Header with Visual Details */}
      <div className="text-center space-y-6 relative py-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary-100/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col items-center gap-4">
           <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Environment Ready: 100% Signal Integrity</span>
           </div>
           <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85]">
             SELECT YOUR <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-100 via-primary-200 to-white">DEPLOYMENT PATH.</span>
           </h1>
           <p className="text-zinc-500 max-w-2xl mx-auto font-bold uppercase tracking-wider text-sm md:text-base opacity-70">
             Our AI Agent adapts to 2,000+ industry signals to simulate a high-stress, technical executive screening.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {dummyInterviews.filter(i => i.id !== "user-1").map((interview) => {
          const Icon = roleIcons[interview.role] || Terminal;
          return (
            <div 
              key={interview.id} 
              className="group relative cursor-pointer"
              onClick={() => setSelectedInterview(interview)}
            >
              <div className="absolute inset-0 bg-primary-100 opacity-0 group-hover:opacity-[0.03] blur-3xl transition-opacity duration-500"></div>
              <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-10 hover:border-primary-100/30 transition-all duration-500 h-full relative overflow-hidden flex flex-col group-hover:shadow-2xl hover:-translate-y-2">
                
                <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-primary-100 group-hover:bg-primary-100 group-hover:text-zinc-950 transition-all duration-500 shadow-xl group-hover:scale-110">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="bg-primary-100/5 text-primary-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-100/10">
                    {interview.level} Tier
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest opacity-60">Deployment Module</p>
                   <h3 className="text-3xl font-black text-white group-hover:text-primary-100 transition-colors uppercase tracking-tight leading-none">
                     {interview.role}
                   </h3>
                   <div className="flex items-center gap-2 text-zinc-500">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Industry Calibrated</span>
                   </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-10">
                  {interview.techstack?.slice(0, 3).map((tech: string, idx: number) => (
                    <span key={idx} className="text-[9px] font-black uppercase tracking-widest bg-zinc-950 text-zinc-400 px-3 py-1.5 rounded-lg border border-white/5 shadow-sm">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between group-hover:border-primary-100/20 transition-colors">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-black text-white flex items-center gap-2 group-hover:text-primary-100 uppercase tracking-widest">
                       <Sparkles className="w-3.5 h-3.5" />
                       Engage Agent
                     </span>
                  </div>
                  <ChevronRight className="w-6 h-6 text-zinc-700 group-hover:text-primary-100 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom Role Option - Ultra Premium Styling */}
        <div 
          className="group relative cursor-pointer"
          onClick={startCustomInterview}
        >
          <div className="absolute inset-0 bg-primary-100 opacity-[0.05] group-hover:opacity-[0.1] blur-[80px] transition-opacity duration-700"></div>
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-primary-100/10 border border-primary-100/30 rounded-[2.5rem] p-10 transition-all duration-700 h-full relative overflow-hidden flex flex-col hover:border-primary-100 hover:shadow-[0_0_50px_rgba(73,222,80,0.15)] hover:-translate-y-2">
            
            <div className="flex justify-between items-start mb-10">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-zinc-950 shadow-2xl shadow-primary-100/20 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-8 h-8 fill-zinc-950" />
              </div>
              <div className="bg-primary-100 text-zinc-950 px-4 py-1.5 rounded-full text-[10px] font-black border border-primary-100/50 uppercase tracking-widest animate-pulse">
                Any Role
              </div>
            </div>

            <div className="space-y-4 mb-8">
               <p className="text-[10px] font-black text-primary-100 uppercase tracking-widest">Dynamic Protocol</p>
               <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-[0.9]">
                 UNIVERSAL <br/> <span className="text-primary-100 text-4xl">SIMULATION.</span>
               </h3>
               <p className="text-xs text-zinc-400 font-medium leading-relaxed uppercase tracking-tight opacity-80">
                 Define your target roles or tech-stack live via voice interaction.
               </p>
            </div>

            <div className="mt-auto pt-8 border-t border-primary-100/20 flex items-center justify-between">
              <span className="text-[11px] font-black text-primary-100 uppercase tracking-widest flex items-center gap-2">
                 INITIALIZE COMMAND &rarr;
              </span>
              <Target className="w-6 h-6 text-primary-100 group-hover:rotate-[360deg] transition-all duration-1000" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
