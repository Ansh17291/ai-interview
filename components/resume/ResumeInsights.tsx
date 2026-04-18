"use client";

import { CheckCircle2, AlertCircle, TrendingUp, Target, Sparkles, Zap } from "lucide-react";

interface ResumeInsightsProps {
  insights: {
    score: number;
    strengths: string[];
    improvements: string[];
    marketRelevance: string;
  };
}

export function ResumeInsights({ insights }: ResumeInsightsProps) {
  if (!insights) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Score Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-100 to-success-100 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-8 bg-dark-300 p-8 rounded-[2.5rem] border border-light-400/5 shadow-2xl overflow-hidden">
          {/* Animated Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/5 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse"></div>
          
          {/* Score Circle */}
          <div className="relative flex-shrink-0">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="74"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-dark-400"
              />
              <circle
                cx="80"
                cy="80"
                r="74"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={465}
                strokeDashoffset={465 - (465 * insights.score) / 100}
                strokeLinecap="round"
                className="text-primary-100 drop-shadow-[0_0_8px_rgba(163,230,53,0.5)] transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white italic">{insights.score}</span>
              <span className="text-[10px] font-black text-primary-100 uppercase tracking-widest">AI SCORE</span>
            </div>
          </div>

          <div className="flex-grow space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary-100" />
              <h3 className="text-2xl font-black text-white italic tracking-tight">AI Resume Analysis</h3>
            </div>
            <div className="p-4 bg-dark-400/50 rounded-2xl border border-light-400/5 backdrop-blur-sm">
              <span className="text-primary-100 font-bold uppercase text-[10px] block mb-2 tracking-widest flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Market Relevance
              </span>
              <p className="text-light-200 leading-relaxed text-sm font-medium">
                {insights.marketRelevance}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-dark-300 p-8 rounded-[2.5rem] border border-success-100/10 hover:border-success-100/30 transition-all duration-500 group shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-success-100/10 rounded-2xl group-hover:bg-success-100 group-hover:text-dark-400 transition-all duration-500">
               <Zap className="w-6 h-6 text-success-100 group-hover:text-dark-400" />
            </div>
            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Core Strengths</h4>
          </div>
          <ul className="space-y-4">
            {insights.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-4 group/item">
                <div className="mt-1 p-1 bg-success-100/20 rounded-full group-hover/item:rotate-12 transition-transform">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-100" />
                </div>
                <span className="text-light-200 text-sm font-medium leading-snug group-hover/item:text-white transition-colors">
                  {strength}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-dark-300 p-8 rounded-[2.5rem] border border-amber-500/10 hover:border-amber-500/30 transition-all duration-500 group shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500 group-hover:text-dark-400 transition-all duration-500">
               <Target className="w-6 h-6 text-amber-500 group-hover:text-dark-400" />
            </div>
            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter text-amber-500 group-hover:text-white transition-colors">Improvement Points</h4>
          </div>
          <ul className="space-y-4">
            {insights.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-4 group/item">
                <div className="mt-1 p-1 bg-amber-500/20 rounded-full group-hover/item:-translate-y-0.5 transition-transform">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="text-light-200 text-sm font-medium leading-snug group-hover/item:text-white transition-colors">
                  {improvement}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="p-6 bg-dark-200/50 border border-light-400/5 rounded-3xl text-center backdrop-blur-md">
         <p className="text-xs text-light-400 font-bold uppercase tracking-[0.2em]">
           Generated from your performance profile & market standards
         </p>
      </div>
    </div>
  );
}
