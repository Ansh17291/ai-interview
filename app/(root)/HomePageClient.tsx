"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Send,
  Bot,
  FileText,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  TrendingUp,
  Zap,
  Award,
  Globe,
  Trophy,
  Target,
  Rocket,
  Clock,
  Sparkles,
} from "lucide-react";

import Chatbot from "@/components/Chatbot";
import { User, Interview, Feedback } from "@/types";
import { dummyInterviews } from "@/constants";
import { cn } from "@/lib/utils";

interface HomePageClientProps {
  user?: User | null;

  // UI-driven props (best for layout flexibility)
  userInterviewsNode: React.ReactNode;
  allInterviewNode: React.ReactNode;
  completedInterviewsNode: React.ReactNode;

  // Data-driven props (from incoming)
  userInterviews?: Interview[];
  allInterview?: Interview[];
  feedbacksMap?: Record<string, Feedback>;

  // Stats (from HEAD)
  stats: {
    totalInterviews: number;
    completedInterviews: number;
    totalQuizzes: number;
    averageScore: number;
  };
}

export default function HomePageClient({
  user,
  userInterviewsNode,
  allInterviewNode,
  completedInterviewsNode,
  userInterviews = [],
  allInterview = [],
  feedbacksMap = {},
  stats,
}: HomePageClientProps) {
  const hasPastInterviews = userInterviews.length > 0;
  const hasUpcomingInterviews = allInterview.length > 0;
  const userName = user?.name?.split(" ")[0]?.toUpperCase() || "AGENT";

  return (
    <div className="relative min-h-screen space-y-24 animate-in fade-in duration-1000 pb-32">
      {/* Immersive Neural Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-100/10 blur-[160px] rounded-full animate-pulse transition-all duration-[15000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600/5 blur-[180px] rounded-full animate-pulse delay-2000 transition-all duration-[12000ms]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-[0.04] pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-100 via-transparent to-dark-100/50"></div>
      </div>

      {/* Futuristic Command Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 relative px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-[2px] w-12 bg-gradient-to-r from-primary-100 to-transparent"></div>
             <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary-100 drop-shadow-[0_0_8px_rgba(221,223,255,0.5)]">
               Security Level: Delta-9
             </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase">
            GREETINGS, <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-primary-100 to-primary-100/40">
              {userName}
            </span>
          </h1>
          <div className="flex items-center gap-4 text-zinc-500 font-bold uppercase tracking-widest text-xs md:text-sm">
             <span>Access Granted</span>
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
             <span className="opacity-40">•</span>
             <span>System Load: 14.2%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-5 rounded-[2rem] shadow-2xl relative group overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-primary-100/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="flex flex-col items-end relative z-10">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Node</span>
              <span className="text-sm font-black text-white uppercase tracking-tight">Silicon Valley <span className="text-primary-100">TX-1</span></span>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center relative group-hover:border-primary-100/30 transition-all duration-500">
              <div className="absolute inset-0 bg-primary-100/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity"></div>
              <Globe className="w-7 h-7 text-primary-100" strokeWidth={1.5} />
           </div>
        </div>
      </div>

      {/* Immersive Hero Simulation Suite */}
      <div className="relative group overflow-hidden rounded-[3rem] border border-white/10 bg-zinc-950 p-[1px] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-100/10 via-transparent to-primary-200/5 opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100/5 blur-[120px] rounded-full group-hover:bg-primary-100/10 transition-colors duration-700"></div>
        
        <div className="relative bg-[#050608] rounded-[2.95rem] p-10 md:p-20 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
            <div className="space-y-8 text-center lg:text-left flex-1">
              <div className="inline-flex items-center gap-3 bg-white/[0.05] px-5 py-2.5 rounded-full border border-white/10 shadow-inner backdrop-blur-md">
                 <Rocket className="w-4 h-4 text-primary-100 animate-bounce" />
                 <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Neural Simulation Active</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-primary-100 animate-pulse"></div>
              </div>
              
              <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.8] flex flex-col gap-2">
                <span>OPTIMIZE YOUR</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-100 to-white">LEGACY.</span>
              </h2>
              
              <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl font-semibold leading-snug opacity-90">
                Deploying advanced behavioral analytics to simulate elite interview environments. <span className="text-white">Precision is not an option—it's the baseline.</span>
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10 pt-6 border-t border-white/5 mx-auto lg:mx-0 max-w-xl">
                 {[
                    { label: 'Latency', value: '14MS', icon: Zap },
                    { label: 'Integrity', value: '99.9%', icon: CheckCircle2 },
                    { label: 'Metrics', value: '5K+ DATA', icon: Target }
                 ].map(m => (
                    <div key={m.label} className="flex gap-3 items-center">
                       <div className="p-2 rounded-lg bg-zinc-900 border border-white/5">
                          <m.icon className="w-4 h-4 text-zinc-500" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">{m.label}</span>
                          <span className="text-base font-black text-white tracking-widest">{m.value}</span>
                       </div>
                    </div>
                 ))}
              </div>
            </div>

            <Link href="/interview" className="w-full lg:w-auto relative group/btn shrink-0">
               <div className="absolute -inset-10 bg-primary-100/20 blur-[60px] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700 animate-pulse"></div>
               <div className="relative p-[1px] bg-gradient-to-br from-white/20 to-transparent rounded-[2.5rem]">
                  <Button className="w-full lg:w-[320px] h-24 md:h-32 px-10 text-2xl md:text-4xl font-black bg-white text-zinc-950 hover:bg-primary-100 transition-all duration-500 rounded-[2.4rem] shadow-2xl uppercase tracking-tighter flex items-center justify-between group/inner">
                    ENGAGE 
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-zinc-950 flex items-center justify-center group-hover/btn:bg-zinc-900 transition-colors shadow-inner">
                       <Send className="w-6 h-6 md:w-8 md:h-8 text-white group-hover/inner:translate-x-1 group-hover/inner:-translate-y-1 transition-transform duration-300" strokeWidth={2.5} />
                    </div>
                  </Button>
               </div>
            </Link>
          </div>
          
          {/* Subtle bottom decorative line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-primary-100/30 to-transparent"></div>
        </div>
      </div>

      {/* Neural Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Total Deployments', value: stats.totalInterviews, icon: Bot, color: 'text-primary-100', glow: 'shadow-[0_0_30px_rgba(221,223,255,0.15)]', rank: 'TIER-1 ARCHITECT' },
            { label: 'Vector Accuracy', value: `${stats.averageScore}%`, icon: Award, color: 'text-emerald-400', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]', rank: 'ELITE STATUS' },
            { label: 'Neural Capacity', value: stats.totalQuizzes, icon: Zap, color: 'text-purple-400', glow: 'shadow-[0_0_30px_rgba(192,132,252,0.15)]', rank: 'SYSTEM MASTER' },
            { label: 'Sync Rate', value: `${Math.round((stats.completedInterviews / (stats.totalInterviews || 1)) * 100)}%`, icon: Target, color: 'text-blue-400', glow: 'shadow-[0_0_30_rgba(96,165,250,0.15)]', rank: 'OPTIMIZED' },
          ].map((s, i) => (
            <div key={i} className={cn("group relative border-gradient p-px rounded-[2rem]", s.glow)}>
               <div className="bg-zinc-950 shadow-2xl rounded-[1.95rem] p-8 h-full flex flex-col relative overflow-hidden border border-white/5 transition-all duration-500 hover:border-white/10">
                  <div className={cn("absolute -top-10 -right-10 w-32 h-32 blur-3xl rounded-full opacity-10 group-hover:opacity-20 transition-opacity bg-current", s.color)}></div>
                  
                  <div className="flex justify-between items-start mb-10">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-900 border border-white/5", s.color)}>
                       <s.icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col items-end">
                       <span className={cn("text-[9px] font-black uppercase tracking-[0.3em]", s.color)}>{s.rank}</span>
                       <div className="flex gap-1 mt-1">
                          {[1,2,3,4].map(dot => <div key={dot} className={cn("w-1.5 h-0.5 rounded-full bg-white opacity-10", dot <= i+1 && "opacity-60")}></div>)}
                       </div>
                    </div>
                  </div>

                  <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">{s.label}</span>
                  <p className="text-6xl font-black text-white mb-2 tracking-tighter">{s.value}</p>
                  
                  <div className="mt-auto pt-6 flex items-center gap-3">
                     <div className="flex-1 h-px bg-white/5"></div>
                     <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest whitespace-nowrap">Live Feed Trace</span>
                  </div>
               </div>
            </div>
          ))}
      </div>

      {/* Mission Control Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Side: Rapid Scenarios Engine */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group">
                  <Bot className="w-7 h-7 text-primary-100 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
               </div>
               <div className="flex flex-col">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1">Rapid Scenarios</h3>
                  <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest">Active Simulation Pools: 142</p>
               </div>
            </div>
            <Link href="/interview" className="group flex items-center gap-3 bg-white/[0.03] px-6 py-3 rounded-full border border-white/10 hover:bg-white hover:text-dark-100 transition-all duration-300">
               <span className="text-[10px] font-black uppercase tracking-widest">All Modules</span>
               <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dummyInterviews.slice(0, 4).map((interview) => (
              <Link key={interview.id} href={`/interview/${interview.id}`} className="group relative">
                <div className="absolute inset-0 bg-primary-100 opacity-0 group-hover:opacity-[0.02] blur-3xl transition-opacity duration-700"></div>
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 hover:border-primary-100/30 transition-all duration-500 h-full relative overflow-hidden shadow-2xl">
                  <div className="flex justify-between items-start mb-10">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-950 border border-white/5 flex items-center justify-center ring-offset-4 ring-offset-dark-100 group-hover:ring-4 ring-primary-100/20 transition-all duration-500 shadow-2xl">
                        <Rocket className="w-7 h-7 text-primary-100" strokeWidth={1} />
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-primary-100 uppercase tracking-[0.3em] bg-primary-100/10 px-3 py-1.5 rounded-lg border border-primary-100/20 mb-2">Verified</span>
                        <div className="flex gap-0.5">
                           {[1,2,3].map(s => <Sparkles key={s} className="w-2 h-2 text-primary-100/30" />)}
                        </div>
                     </div>
                  </div>

                  <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter group-hover:text-primary-100 transition-colors leading-[0.95]">{interview.role}</h3>
                  
                  <div className="flex items-center gap-6 mb-10">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tier</span>
                       <span className="text-sm font-black text-white uppercase tracking-wider">{interview.level}</span>
                    </div>
                    <div className="w-px h-8 bg-white/5"></div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">ETA</span>
                       <span className="text-sm font-black text-white uppercase tracking-wider">12 MINS</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-12">
                    {interview.techstack.slice(0, 3).map((tech: string, i: number) => (
                      <span key={i} className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-xl hover:bg-white hover:text-dark-100 transition-colors">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <Button className="w-full h-16 bg-white/[0.02] hover:bg-white text-white hover:text-dark-100 font-bold uppercase tracking-[0.3em] text-[11px] rounded-2xl transition-all duration-500 border border-white/10 hover:border-transparent group-hover:scale-[1.02] shadow-xl">
                     ENGAGE PROTOCOL
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side: Global Activity Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-12 sticky top-24">
           <div className="flex items-center gap-5 border-b border-white/5 pb-8">
               <div className="w-14 h-14 rounded-2xl bg-primary-100/5 border border-primary-100/10 flex items-center justify-center shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary-100/10 animate-pulse"></div>
                  <Target className="w-7 h-7 text-primary-100" strokeWidth={1} />
               </div>
               <div className="flex flex-col">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1">Live Hub</h3>
                  <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                     Global Sync Active
                  </p>
               </div>
           </div>

           <div className="flex flex-col gap-10">
              {/* Performance Section */}
              {hasPastInterviews && (
                <div className="space-y-6">
                   <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-10 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 bg-primary-100/5 blur-3xl rounded-full"></div>
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em]">Analytics Stream</span>
                         <Award className="w-5 h-5 text-primary-100/30" />
                      </div>
                      <div className="space-y-6 relative z-10">
                        {completedInterviewsNode}
                      </div>
                   </div>
                </div>
              )}

              {/* Feed Section */}
              {hasUpcomingInterviews && (
                <div className="space-y-6">
                   <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-10 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 bg-blue-500/5 blur-3xl rounded-full"></div>
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.5em]">Live Trace</span>
                         <Clock className="w-5 h-5 text-zinc-700 animate-spin-slow" />
                      </div>
                      <div className="max-h-[550px] overflow-y-auto pr-4 space-y-6 custom-scrollbar scroll-smooth">
                         {allInterviewNode}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none z-10"></div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}
