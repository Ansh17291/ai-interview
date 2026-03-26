import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId, getInterviewById } from "@/lib/actions/general.action";
import { Calendar, Star, MessageSquare, ArrowRight } from "lucide-react";

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
    Behavioral: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    Mixed: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    Technical: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  }[normalizedType] || "bg-purple-500/20 text-purple-400 border border-purple-500/30";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  const displayScore = feedback?.totalScore || score;
  const displayQuestionsCount = questionsCount || interview?.questions?.length || 0;

  return (
    <Link href={hasTranscript ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>
      <div className="bg-dark-300 border border-light-400/20 rounded-xl p-6 hover:border-primary-100/50 hover:bg-dark-300/80 transition-all cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg capitalize">{level} {role} Interview</h3>
              <span className={cn("text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1", badgeColorBg)}>
                {normalizedType}
              </span>
            </div>
          </div>
          {displayScore !== undefined && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span className="font-bold">{displayScore}/100</span>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <p className="text-light-300 text-sm line-clamp-2 mb-4 flex-1">
          {summary || "No summary available"}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-light-400 text-xs mb-4 border-t border-light-400/10 pt-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {displayQuestionsCount} Questions
          </div>
        </div>

        {/* Tech Stack & Button */}
        <div className="flex items-center justify-between">
          <DisplayTechIcons techStack={techstack} />
          <Button className="bg-primary-100/20 text-primary-100 hover:bg-primary-100/30 border border-primary-100/30 font-semibold">
            {hasTranscript ? "View Feedback" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default InterviewCard;
