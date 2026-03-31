import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Trophy, 
  Calendar, 
  Clock, 
  ChevronLeft,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  Zap,
  UserCheck,
  Award
} from "lucide-react";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getRandomInterviewCover } from "@/lib/utils";
import DisplayTechIcons from "@/components/DisplayTechIcons";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const FeedbackPage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/sign-in");
  }

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id,
  });

  let transcript = feedback?.transcript || interview?.transcript || [];
  
  // Safety check: if transcript is a string (legacy/error), convert it to array format
  if (typeof transcript === "string") {
    transcript = [{ role: "interviewer", content: transcript }];
  } else if (!Array.isArray(transcript)) {
    transcript = [];
  }

  const score = feedback?.totalScore || interview?.score || 0;
  const keyPoints = feedback?.keyPoints || interview?.keyPoints || [];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-fadeIn">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link href="/" className="text-light-400 hover:text-white flex items-center gap-2 transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>
      </div>

      {/* Header Info Card */}
      <div className="dark-gradient p-8 rounded-3xl border border-light-400/10 shadow-xl mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <Image
            src={getRandomInterviewCover()}
            alt="cover-image"
            width={120}
            height={120}
            className="rounded-2xl object-cover size-[120px] shadow-lg border-2 border-dark-100"
          />

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
              <span className="bg-primary-100/10 text-primary-100 px-3 py-0.5 rounded-full text-xs font-bold border border-primary-100/20 uppercase tracking-wider">
                {interview.type}
              </span>
              <span className="bg-success-100/10 text-success-100 px-3 py-0.5 rounded-full text-xs font-bold border border-success-100/20 uppercase tracking-wider">
                {interview.level}
              </span>
              {feedback?.recommendation && (
                <span className={`px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                  feedback.recommendation.includes("Hire") && !feedback.recommendation.includes("No") 
                  ? "bg-success-100/10 text-success-100 border-success-100/20" 
                  : "bg-destructive-100/10 text-destructive-100 border-destructive-100/20"
                }`}>
                  {feedback.recommendation}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 capitalize">
              {interview.role} <span className="text-primary-100">Feedback</span>
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-light-400 text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary-200" />
                <span>{new Date(interview.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary-200" />
                <span>{transcript.length} Messages exchanged</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
             <div className="bg-dark-100/50 p-6 rounded-2xl border border-light-400/10 text-center min-w-[140px]">
              <p className="text-xs text-light-400 uppercase font-bold tracking-widest mb-1">Overall Score</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-5xl font-black ${score >= 70 ? 'text-success-100' : 'text-primary-100'}`}>{score}</span>
                <span className="text-light-400 text-xl">/100</span>
              </div>
            </div>

            {feedback?.technicalDepth !== undefined && (
              <div className="bg-dark-100/50 p-6 rounded-2xl border border-light-400/10 text-center min-w-[140px]">
                <p className="text-xs text-light-400 uppercase font-bold tracking-widest mb-1">Tech Depth</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-5xl font-black ${feedback.technicalDepth >= 70 ? 'text-success-100' : 'text-primary-100'}`}>{feedback.technicalDepth}</span>
                  <span className="text-light-400 text-xl">/100</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Summary & Scores */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Final Assessment */}
          <div className="bg-dark-200/40 border border-light-400/10 rounded-2xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Award className="w-24 h-24 text-primary-100" />
             </div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> AI Final Assessment
            </h3>
            <p className="text-light-100 leading-relaxed italic relative z-10">
              &quot;{feedback?.finalAssessment || interview.summary || "You have completed the interview session. The AI has analyzed your performance based on the interaction transcript."}&quot;
            </p>
            {feedback?.recommendation && (
               <div className="mt-6 p-4 rounded-xl bg-dark-300/50 border border-light-400/5">
                  <span className="text-xs text-light-400 uppercase font-bold tracking-widest block mb-1">AI Recommendation</span>
                  <p className={`text-xl font-black ${feedback.recommendation.includes("Hire") && !feedback.recommendation.includes("No") ? "text-success-100" : "text-destructive-100"}`}>
                    {feedback.recommendation}
                  </p>
               </div>
            )}
          </div>

          {/* Behavioral Traits */}
          {feedback?.behavioralTraits && feedback.behavioralTraits.length > 0 && (
            <div className="bg-dark-200/40 border border-light-400/10 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary-100" /> Behavioral Traits
              </h3>
              <div className="flex flex-wrap gap-3">
                {feedback.behavioralTraits.map((trait: string, i: number) => (
                  <span key={i} className="bg-primary-100/10 text-primary-100 px-4 py-2 rounded-xl text-sm font-bold border border-primary-100/20">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-success-100/5 border border-success-100/20 rounded-2xl p-6">
              <h4 className="flex items-center gap-2 font-bold text-success-100 mb-4">
                <CheckCircle2 className="w-5 h-5" /> Key Strengths
              </h4>
              <ul className="space-y-3">
                {feedback?.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-light-200 flex gap-2">
                    <span className="text-success-100 mt-1">•</span> {s}
                  </li>
                )) || <li className="text-sm text-light-400">Analysis pending...</li>}
              </ul>
            </div>

            <div className="bg-destructive-100/5 border border-destructive-100/20 rounded-2xl p-6">
              <h4 className="flex items-center gap-2 font-bold text-destructive-100 mb-4">
                <AlertCircle className="w-5 h-5" /> Areas to Improve
              </h4>
              <ul className="space-y-3">
                {feedback?.areasForImprovement?.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-light-200 flex gap-2">
                    <span className="text-destructive-100 mt-1">•</span> {w}
                  </li>
                )) || <li className="text-sm text-light-400">Analysis pending...</li>}
              </ul>
            </div>
          </div>

          {/* Key Topics Covered */}
          <div className="bg-dark-200/40 border border-light-400/10 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" /> Technologies & Topics
            </h3>
            <div className="flex flex-wrap gap-3">
              {interview.techstack.map((tech: string, i: number) => (
                <div key={i} className="bg-dark-300 border border-light-400/10 px-4 py-2 rounded-xl flex items-center gap-3">
                  <DisplayTechIcons techStack={[tech]} />
                  <span className="text-white font-medium text-sm">{tech}</span>
                </div>
              ))}
            </div>
            {keyPoints.length > 0 && (
              <div className="mt-8 pt-6 border-t border-light-400/10">
                <h4 className="text-sm font-bold text-light-400 uppercase tracking-widest mb-4">Performance Highlights</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {keyPoints.map((point: string, i: number) => (
                    <li key={i} className="text-xs text-light-200 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary-100"></div> {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Breakdown & Transcript */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Interview Breakdown */}
          <div className="bg-dark-200/40 border border-light-400/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-100" /> Category Breakdown
            </h3>
            <div className="space-y-6">
              {feedback?.categoryScores?.map((cat: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-light-100">{cat.name}</span>
                    <span className="text-xs font-bold text-primary-100">{cat.score}/100</span>
                  </div>
                  <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${i % 2 === 0 ? 'bg-primary-100' : 'bg-primary-200'}`} 
                      style={{ width: `${cat.score}%` }}
                    ></div>
                  </div>
                  {cat.comment && <p className="text-[10px] text-light-400 italic mt-1">{cat.comment}</p>}
                </div>
              )) || (
                <div className="text-center py-10 text-light-400 text-sm">
                  Detailed category analysis is not available for this session type.
                </div>
              )}
            </div>
          </div>

          {/* Full Transcript */}
          <div className="bg-dark-200/40 border border-light-400/10 rounded-2xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-light-400/10 bg-dark-300/30 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-light-400" /> Interaction Log
              </h3>
              <span className="text-[10px] bg-dark-100 px-2 py-1 rounded text-light-400 uppercase font-bold tracking-tighter">Read-only</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {transcript.length > 0 ? (
                transcript.map((msg: { role: string, content: string }, i: number) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[10px] text-light-400 uppercase font-black tracking-widest">
                        {msg.role === 'user' ? 'You' : 'AI Interviewer'}
                      </span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl max-w-[90%] text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary-200 text-dark-100 font-medium rounded-tr-sm shadow-md' 
                        : 'bg-dark-100 border border-light-400/10 text-light-100 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-light-400 p-10">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-10" />
                  <p className="text-sm">Transcript could not be loaded for this session.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center border-t border-light-400/10 pt-10">
        <Button className="h-14 px-8 rounded-xl bg-dark-200 border border-light-400/20 text-white font-bold hover:bg-dark-300 transition-all flex items-center gap-2" asChild>
          <Link href="/">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
        </Button>

        <Button className="h-14 px-10 rounded-xl bg-primary-100 text-dark-100 font-black text-lg hover:bg-primary-200 transition-all shadow-lg flex items-center gap-2" asChild>
          <Link href={`/interview/${id}?start=true`}>
            Retake Mock Interview <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default FeedbackPage;
