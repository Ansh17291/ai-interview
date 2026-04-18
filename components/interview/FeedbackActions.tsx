"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FeedbackActionsProps {
  interviewId: string;
}

const FeedbackActions = ({ interviewId }: FeedbackActionsProps) => {
  const handleShare = () => {
    // In a real app, this would copy a unique shareable URL
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Enterprise report link copied to clipboard!", {
      description: "Recruiters can now access this verified performance dashboard.",
      icon: <Zap className="w-4 h-4 text-primary-100" />,
    });
  };

  return (
    <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center border-t border-light-400/10 pt-10">
      <Button 
        variant="outline"
        className="h-14 px-8 rounded-xl bg-dark-200 border border-light-400/20 text-white font-bold hover:bg-dark-300 transition-all flex items-center gap-2 group" 
        asChild
      >
        <Link href="/">
          <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" /> Dashboard
        </Link>
      </Button>

      <Button 
        variant="outline" 
        className="h-14 px-8 rounded-xl border-primary-100/30 text-primary-100 font-bold hover:bg-primary-100/10 transition-all flex items-center gap-2 group"
        onClick={handleShare}
      >
        <Zap className="w-5 h-5 group-hover:animate-pulse" /> Verify & Share Report
      </Button>

      <Button 
        className="h-14 px-10 rounded-xl bg-primary-100 text-dark-100 font-black text-lg hover:bg-primary-200 transition-all shadow-lg flex items-center gap-2 group relative overflow-hidden" 
        asChild
      >
        <Link href={`/interview/${interviewId}?start=true`}>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative z-10 flex items-center gap-2 text-dark-100">
            Retake Mock Interview <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </Button>
    </div>
  );
};

export default FeedbackActions;
