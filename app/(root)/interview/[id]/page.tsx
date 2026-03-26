import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Award, Briefcase, ChevronRight, Play } from "lucide-react";

import Agent from "@/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

const InterviewDetails = async ({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ start?: string }>
}) => {
  const { id } = await params;
  const { start } = await searchParams;
  const isStarted = start === "true";

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

  if (isStarted) {
    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto py-10">
        <div className="flex flex-row gap-4 justify-between items-center bg-dark-200/50 p-6 rounded-2xl border border-light-400/10">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={60}
              height={60}
              className="rounded-full object-cover size-[60px] border-2 border-primary-100/30"
            />
            <div>
              <h3 className="text-2xl font-bold capitalize text-white">{interview.role} Interview</h3>
              <p className="text-light-200">{interview.level} • {interview.type}</p>
            </div>
          </div>
          <Link href={`/interview/${id}`}>
            <Button variant="outline" className="text-light-200 border-light-400/20 hover:bg-dark-300">
              Exit Interview
            </Button>
          </Link>
        </div>

        <Agent
          userName={user.name ?? "Anonymous"}
          userId={user.id}
          interviewId={id}
          type="interview"
          questions={interview.questions}
          feedbackId={feedback?.id}
          role={interview.role}
          level={interview.level}
          techStack={interview.techstack}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fadeIn">
      {/* Header Section */}
      <div className="dark-gradient p-10 rounded-3xl border border-light-400/10 shadow-2xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/5 blur-3xl rounded-full -mr-20 -mt-20"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="relative">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={160}
              height={160}
              className="rounded-2xl object-cover size-[160px] shadow-lg border-4 border-dark-100"
            />
            <div className="absolute -bottom-3 -right-3 bg-primary-100 text-dark-100 p-2 rounded-xl shadow-lg">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
              <span className="bg-primary-100/10 text-primary-100 px-4 py-1 rounded-full text-sm font-bold border border-primary-100/20 capitalize">
                {interview.type}
              </span>
              <span className="bg-success-100/10 text-success-100 px-4 py-1 rounded-full text-sm font-bold border border-success-100/20 capitalize">
                {interview.level}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 capitalize leading-tight">
              {interview.role} <span className="text-primary-100">Mock Interview</span>
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-light-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-200" />
                <span>Created {new Date(interview.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-200" />
                <span>~15-20 Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-dark-200/40 border border-light-400/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary-100" /> Interview Preparation
            </h3>
            
            <p className="text-light-100 leading-relaxed mb-8">
              This is a tailored AI-driven mock interview designed to test your proficiency in <span className="text-white font-bold">{interview.role}</span> concepts. 
              The AI will ask structured questions and provide live feedback based on your responses.
            </p>

            <div className="space-y-4">
              <h4 className="text-sm uppercase tracking-widest text-light-400 font-bold mb-4">Focus Technologies</h4>
              <div className="flex flex-wrap gap-3">
                {interview.techstack.map((tech, i) => (
                  <div key={i} className="bg-dark-300 border border-light-400/10 px-4 py-2 rounded-xl flex items-center gap-3">
                    <DisplayTechIcons techStack={[tech]} />
                    <span className="text-white font-medium">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-primary-100/5 border border-primary-100/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">What to Expect</h3>
            <ul className="space-y-4">
              {[
                "AI will guide you through 5-10 structured questions.",
                "Real-time sentiment and technical accuracy analysis.",
                "A detailed feedback report will be generated at the end.",
                "You can pause or exit the interview at any time."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-light-100">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-100 shrink-0"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar Info & Action */}
        <div className="flex flex-col gap-6">
          <div className="dark-gradient p-8 rounded-2xl border border-primary-100/20 flex flex-col gap-6">
            <div className="text-center">
              <p className="text-light-200 text-sm mb-1 uppercase tracking-tighter font-bold">Current Status</p>
              <p className="text-2xl font-black text-white">Ready to Start</p>
            </div>
            
            <div className="h-px bg-light-400/10 w-full"></div>

            <Link href={`/interview/${id}?start=true`} className="w-full">
              <Button className="w-full h-16 rounded-xl bg-primary-100 text-dark-100 font-black text-xl hover:bg-primary-200 transition-all shadow-[0_0_30px_rgba(73,222,80,0.3)] hover:shadow-[0_0_40px_rgba(73,222,80,0.5)] flex items-center justify-center gap-3">
                <Play className="w-6 h-6 fill-current" /> Start Interview
              </Button>
            </Link>

            <p className="text-xs text-center text-light-400 px-4">
              By starting, you agree to allow AI to process your voice and transcript for feedback.
            </p>
          </div>

          {feedback && (
            <div className="bg-success-100/5 border border-success-100/20 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">Previous Score</h4>
                <span className="text-2xl font-black text-success-100">{feedback.totalScore}/100</span>
              </div>
              <Link href={`/interview/${id}/feedback`} className="text-sm text-success-100 hover:underline flex items-center gap-1">
                View Full Feedback Report <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewDetails;
