import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId, getInterviewById } from "@/lib/actions/general.action";
import { Calendar, Star, MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";
import { TranscriptDialog } from "./interview/TranscriptDialog";

interface InterviewCardProps {
  interviewId: string;
  userId?: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  createdAt: string;
  questionsCount?: number;
  score?: number;
  summary?: string;
}

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  level,
  type,
  techstack,
  createdAt,
  questionsCount,
  score,
  summary,
}: InterviewCardProps) => {
  const [feedback, interview] = await Promise.all([
    userId && interviewId
      ? getFeedbackByInterviewId({
        interviewId,
        userId,
      })
      : null,
    interviewId ? getInterviewById(interviewId) : null,
  ]);

  const hasTranscript = !!(feedback?.transcript || interview?.transcript);
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColorBg = {
    Behavioral: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    Mixed: "text-purple-400 border-purple-500/20 bg-purple-500/5",
    Technical: "text-orange-400 border-orange-500/20 bg-orange-500/5",
  }[normalizedType] || "text-primary-100 border-white/5 bg-white/5";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  const displayScore = feedback?.totalScore || score;
  const displayQuestionsCount = questionsCount || interview?.questions?.length || 0;

  return (
    <div className="group relative">
      <Link href={hasTranscript ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>
        <div className="bg-zinc-950/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 hover:border-primary-100/30 transition-all duration-500 cursor-pointer h-full flex flex-col hover:shadow-2xl hover:shadow-primary-100/5 hover:-translate-y-1 relative overflow-hidden">
          
          {/* Status Indicator */}
          <div className="absolute top-0 right-10">
             <div className={cn("px-4 py-1 rounded-b-xl text-[9px] font-black uppercase tracking-widest border-x border-b border-white/5", hasTranscript ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-400/10 text-amber-400 border-amber-400/20")}>
                {hasTranscript ? "Finalized" : "Draft"}
             </div>
          </div>

          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-5 flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-100/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Image
                  src={getRandomInterviewCover()}
                  alt="cover"
                  width={60}
                  height={60}
                  className="rounded-2xl object-cover border border-white/10 relative z-10"
                />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{level} PRO-TIER</p>
                <h3 className="font-black text-white text-xl line-clamp-1 uppercase tracking-tight group-hover:text-primary-100 transition-colors uppercase">{role}</h3>
                <div className="flex items-center gap-2 mt-2">
                   <span className={cn("text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest", badgeColorBg)}>
                    {normalizedType}
                  </span>
                  {hasTranscript && (
                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/10 bg-emerald-500/5 px-2 py-1 rounded-lg">
                       <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            {displayScore !== undefined && (
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Score Matrix</span>
                <div className="flex items-center gap-1.5 text-white bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-xl shadow-xl">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                  <span className="font-black text-lg tracking-tighter">{displayScore}<span className="text-[10px] text-zinc-600 ml-0.5">/100</span></span>
                </div>
              </div>
            )}
          </div>

          {/* Transcript Snippet / Summary */}
          <div className="flex-1 bg-zinc-950/50 rounded-2xl p-5 border border-white/5 mb-8 group-hover:bg-zinc-950 transition-colors">
            <p className="text-zinc-400 text-xs font-medium leading-relaxed italic line-clamp-2 uppercase tracking-tight opacity-70">
              {summary || "Analyzing interaction patterns and technical depth indicators..."}
            </p>
          </div>

          {/* Meta Info Hub */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5">
             <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">Timestamp</span>
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 text-primary-100/50" />
                      {formattedDate}
                   </div>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em]">Questions</span>
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-300">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400/50" />
                      {displayQuestionsCount}
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <DisplayTechIcons techStack={techstack} />
                {hasTranscript ? (
                  <Button className="h-10 px-5 bg-white text-zinc-950 hover:bg-primary-100 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-white/5">
                     Intelligence Report <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                ) : (
                  <Button className="h-10 px-5 bg-primary-100/10 text-primary-100 hover:bg-primary-100 hover:text-zinc-950 border border-primary-100/20 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
                     Engage Engine <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                )}
             </div>
          </div>
        </div>
      </Link>
      
      {/* Floating Action (Transcript Dialog) */}
      {hasTranscript && (
        <div className="absolute top-4 right-4 z-20">
          <TranscriptDialog 
            transcript={(feedback?.transcript || interview?.transcript) as any} 
            role={role}
            level={level}
          />
        </div>
      )}
    </div>
  );
};

export default InterviewCard;
