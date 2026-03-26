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
} from "lucide-react";

import Chatbot from "@/components/Chatbot";
import InterviewCard from "@/components/InterviewCard";

import { dummyInterviews } from "@/constants";
import { signOut } from "@/lib/actions/auth.action";


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

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-6xl font-extrabold text-white tracking-tight">
          WELCOME BACK, <span className="text-primary-100 uppercase">{(user?.name?.split(" ")[0]) || "PREPPER"}!</span> 👋
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl">
          You are on track to master your next interview. Here is your current progress overview.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="group bg-zinc-900/50 border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:border-primary-100/30 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-16 h-16 md:w-20 md:h-20" />
             </div>
            <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4">Total Interviews</p>
            <p className="text-4xl md:text-5xl font-black text-white">{stats.totalInterviews}</p>
            <div className="mt-6 flex items-center gap-2 text-primary-100 text-xs md:text-sm font-bold bg-primary-100/10 w-fit px-3 py-1 rounded-full">
               <TrendingUp className="w-4 h-4" /> Lifetime
            </div>
          </div>

          <div className="group bg-zinc-900 border border-white/5 rounded-[2rem] p-8 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CheckCircle2 className="w-20 h-20" />
             </div>
            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">Completed</p>
            <p className="text-5xl font-black text-white">{stats.completedInterviews}</p>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-500/10 w-fit px-3 py-1 rounded-full">
               <CheckCircle2 className="w-4 h-4" /> Finalized
            </div>
          </div>

          <div className="group bg-zinc-900 border border-white/5 rounded-[2rem] p-8 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BookOpen className="w-20 h-20" />
             </div>
            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">Quizzes Taken</p>
            <p className="text-5xl font-black text-white">{stats.totalQuizzes}</p>
            <div className="mt-6 flex items-center gap-2 text-blue-400 text-sm font-bold bg-blue-500/10 w-fit px-3 py-1 rounded-full">
               <BookOpen className="w-4 h-4" /> Mastery
            </div>
          </div>

          <div className="group bg-zinc-900/50 border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Award className="w-16 h-16 md:w-20 md:h-20" />
             </div>
            <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4">Avg Score</p>
            <p className="text-4xl md:text-5xl font-black text-white">{stats.averageScore}%</p>
            <div className="mt-6 flex items-center gap-2 text-purple-400 text-sm font-bold bg-purple-500/10 w-fit px-3 py-1 rounded-full">
               <Award className="w-4 h-4" /> Global Rank
            </div>
          </div>

          <div className="group bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 hover:border-orange-500/40 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-16 h-16 md:w-20 md:h-20 text-orange-500" />
             </div>
            <p className="text-orange-500/70 text-[10px] md:text-xs font-black uppercase tracking-widest mb-4">Practice Streak</p>
            <p className="text-4xl md:text-5xl font-black text-white flex items-baseline gap-2">4 <span className="text-lg text-zinc-600">DAYS</span></p>
            <div className="mt-6 flex items-center gap-2 text-orange-500 text-sm font-bold bg-orange-500/20 w-fit px-3 py-1 rounded-full animate-pulse">
               <Zap className="w-4 h-4 fill-current" /> YOU&apos;RE ON FIRE!
            </div>
          </div>
        </div>
      )}

      {/* Main Action Banner */}
      <div className="relative group overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-zinc-900 p-8 md:p-12">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary-100/10 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
              PUSH YOUR <br className="hidden md:block"/> <span className="text-primary-100">BOUNDARIES.</span>
            </h2>
            <p className="text-zinc-400 text-base md:text-lg max-w-lg font-medium">
              Start a custom AI-driven mock interview and discover your hidden potential with detailed analytics.
            </p>
          </div>
          <Link href="/interview" className="w-full md:w-auto">
            <Button className="w-full md:w-auto h-16 md:h-20 px-8 md:px-12 text-xl md:text-2xl font-black bg-primary-100 text-zinc-950 hover:bg-white transition-all duration-500 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 group">
              LAUNCH AGENT <Send className="w-5 h-5 md:w-6 md:h-6 ml-3 group-hover:translate-x-3 transition-transform duration-500" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Start Interviews */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">PRESET SCENARIOS</h2>
            <div className="w-20 h-1 bg-primary-100 rounded-full"></div>
          </div>
          <Link href="/interview" className="text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors mb-2">
            View All Templates &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dummyInterviews.map((interview) => (
            <Link key={interview.id} href={`/interview/${interview.id}`}>
              <div className="group bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 hover:bg-zinc-900 transition-all duration-500 h-full cursor-pointer flex flex-col relative overflow-hidden">
                <div className="bg-zinc-900 border border-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:ring-4 ring-primary-100/10 transition-all duration-500">
                  <Bot className="w-8 h-8 text-primary-100" />
                </div>

                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-primary-100 transition-colors">{interview.role}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full">
                    {interview.level} Proficiency
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {interview.techstack.slice(0, 3).map((tech: string, i: number) => (
                    <span key={i} className="text-[10px] uppercase font-black tracking-widest text-zinc-400 bg-white/5 px-2 py-1 rounded-md">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between group-hover:border-primary-100/20 transition-colors">
                   <span className="text-[10px] font-black uppercase text-zinc-500">Duration: 15min</span>
                   <Button variant="ghost" className="h-8 px-4 text-xs font-black uppercase tracking-widest text-primary-100 hover:bg-primary-100 hover:text-zinc-950 rounded-full">
                    START
                   </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* History Sections */}
      <div className="grid lg:grid-cols-2 gap-12">
        {hasPastInterviews && (
          <section className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">RECENT PERFORMANCE</h2>
              <div className="w-20 h-1 bg-emerald-500 rounded-full"></div>
            </div>
            <div className="grid gap-4 bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/5">
              {completedInterviewsNode}
            </div>
          </section>
        )}

        {hasUpcomingInterviews && (
          <section className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">GLOBAL FEED</h2>
              <div className="w-20 h-1 bg-blue-500 rounded-full"></div>
            </div>

            <div className="grid gap-4 bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/5">
              {allInterview?.slice(0, 5).map((interview) => (
                <InterviewCard
                  key={interview.id}
                  userId={user?.id}
                  interviewId={interview.id}
                  role={interview.role}
                  type={interview.type}
                  techstack={interview.techstack}
                  createdAt={interview.createdAt}
                  level={interview.level}
                  summary={interview.summary}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Chatbot overlay */}
      <Chatbot />
    </div>
  );
}


