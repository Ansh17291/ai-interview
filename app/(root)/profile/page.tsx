import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getFeedbackByInterviewId, getQuizResultsByUserId, getQuizzesByUserId } from "@/lib/actions/general.action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { ArrowRight, FileText, CheckCircle2, TrendingUp, Zap, Star, BookOpen, Trophy, RotateCcw } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [interviews, quizResults, userQuizzes] = await Promise.all([
    getInterviewsByUserId(user.id),
    getQuizResultsByUserId(user.id),
    getQuizzesByUserId(user.id),
  ]);

  const completedInterviews = interviews?.filter((i) => i.finalized) || [];

  // Fetch feedbacks for completed interviews to calculate average score and analytics
  const feedbacks = await Promise.all(
    completedInterviews.map((interview) =>
      getFeedbackByInterviewId({ interviewId: interview.id, userId: user.id })
    )
  );

  const validFeedbacks = feedbacks.filter((f): f is Feedback => f !== null);
  
  // Calculate combined average score (Interviews + Quizzes)
  const interviewScores = validFeedbacks.map(f => f.totalScore);
  const quizScores = quizResults.map(q => (q.score / q.totalQuestions) * 100);
  const allScores = [...interviewScores, ...quizScores];
  
  const averageScore = allScores.length > 0
    ? Math.round(allScores.reduce((acc, curr) => acc + curr, 0) / allScores.length)
    : 0;

  // Aggregate category scores
  const categoryAverages: Record<string, { total: number; count: number }> = {};
  validFeedbacks.forEach(f => {
    f.categoryScores?.forEach(cs => {
      if (!categoryAverages[cs.name]) {
        categoryAverages[cs.name] = { total: 0, count: 0 };
      }
      categoryAverages[cs.name].total += cs.score;
      categoryAverages[cs.name].count += 1;
    });
  });

  const analyticsData = Object.entries(categoryAverages).map(([name, data]) => ({
    name,
    score: Math.round(data.total / data.count)
  })).sort((a, b) => b.score - a.score);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 max-w-6xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">Your Dashboard</h1>
          <p className="text-zinc-400 text-base md:text-lg font-medium">Track your performance and manage your account.</p>
        </div>
        <Link href="#upgrade" className="w-full md:w-auto bg-gradient-to-r from-amber-200 to-yellow-500 text-dark-100 font-black px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
          Upgrade to Pro <Zap className="w-5 h-5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Sidebar (User Info & Pro Card) */}
        <div className="lg:col-span-4 flex flex-col gap-8">

          {/* User Info Card */}
          <div className="border-gradient p-0.5 rounded-[2rem] h-fit">
            <div className="bg-zinc-900/50 backdrop-blur-xl rounded-[1.9rem] p-6 md:p-10 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-32 bg-primary-100/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2"></div>

              <div className="mb-8 border-4 border-white/5 shadow-2xl rounded-full w-fit relative z-10 p-1 bg-zinc-800/50">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-primary-100/20">
                  <AvatarFallback className="text-2xl md:text-4xl bg-primary-100 text-zinc-950 font-black">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white mb-1 z-10 uppercase tracking-tight">{user.name}</h2>
              <p className="text-zinc-500 text-xs md:text-sm mb-8 z-10 font-bold uppercase tracking-widest opacity-80">{user.email}</p>

              <div className="w-full grid grid-cols-2 gap-4 pt-8 border-t border-white/5 z-10">
                <div className="flex flex-col items-center p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
                  <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">Interviews</span>
                  <span className="font-black text-white text-2xl md:text-3xl">{interviews?.length || 0}</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-2xl bg-primary-100/5 border border-primary-100/10">
                  <span className="text-primary-100/70 text-[10px] uppercase font-black tracking-widest mb-2">Quizzes</span>
                  <span className="font-black text-white text-2xl md:text-3xl">{quizResults.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Strength Card */}
          <div className="border-gradient p-0.5 rounded-[2rem] h-fit">
            <div className="bg-zinc-900/50 backdrop-blur-xl rounded-[1.9rem] p-8 flex flex-col items-center">
              <h3 className="text-xs font-black text-primary-100 uppercase tracking-widest mb-8">Resume Strength</h3>
              
              <div className="relative w-40 h-40 mb-8">
                {/* Segmented Progress Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-white/5 fill-none" strokeWidth="8" strokeDasharray="210 251" />
                  <circle cx="50" cy="50" r="40" className="stroke-primary-100 fill-none" strokeWidth="8" strokeDasharray="180 251" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white leading-none">82</span>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter mt-1">PERCENT</span>
                </div>
              </div>

              <div className="text-center space-y-4 mb-8">
                <p className="text-sm font-black text-white uppercase tracking-tight">Status: Competitive</p>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">Your profile is stronger than 74% of candidates in the AI/ML sector.</p>
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Github Linked
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 2 Missing Skills
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (Analytics & Activity) */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* Analytics Overview Card */}
          <div className="border-gradient p-0.5 rounded-[2rem] w-full">
            <div className="bg-zinc-900 shadow-2xl rounded-[1.9rem] p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-white/5">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase tracking-tight">Analytics</h3>
                  <p className="text-zinc-500 text-sm md:text-base font-medium">Your aggregated AI interview score metrics</p>
                </div>
                <div className="bg-primary-100/5 p-6 rounded-[1.5rem] text-center border border-primary-100/10 flex flex-col items-center justify-center min-w-[140px]">
                  <p className="text-[10px] text-primary-100 font-black uppercase tracking-widest mb-2">Avg Score</p>
                  <p className="text-4xl font-black text-white">{averageScore}<span className="text-lg text-zinc-600 font-black ml-1">/100</span></p>
                </div>
              </div>

              {validFeedbacks.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-center">
                  {/* Skill Radar Chart (SVG) */}
                  <div className="relative aspect-square w-full max-w-[300px] mx-auto group">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {/* Background Hexagons */}
                      {[0.2, 0.4, 0.6, 0.8, 1].map((p) => (
                        <polygon
                          key={p}
                          points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
                          className="fill-none stroke-white/5"
                          style={{ transform: `scale(${p})`, transformOrigin: 'center' }}
                        />
                      ))}
                      {/* Axis Lines */}
                      <line x1="50" y1="50" x2="50" y2="0" className="stroke-white/5" />
                      <line x1="50" y1="50" x2="93.3" y2="25" className="stroke-white/5" />
                      <line x1="50" y1="50" x2="93.3" y2="75" className="stroke-white/5" />
                      <line x1="50" y1="50" x2="50" y2="100" className="stroke-white/5" />
                      <line x1="50" y1="50" x2="6.7" y2="75" className="stroke-white/5" />
                      <line x1="50" y1="50" x2="6.7" y2="25" className="stroke-white/5" />
                      
                      {/* Data Polygon */}
                      <polygon
                        points="50,15 80,35 75,70 50,85 20,65 30,30"
                        className="fill-primary-100/20 stroke-primary-100 stroke-[1.5] animate-pulse"
                      />
                    </svg>
                    {/* Labels */}
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-[10px] font-black uppercase tracking-tighter text-zinc-400">Logic</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 text-[10px] font-black uppercase tracking-tighter text-zinc-400">Design</span>
                    <span className="absolute top-1/2 right-0 translate-x-8 -translate-y-1/2 text-[10px] font-black uppercase tracking-tighter text-zinc-400">Soft Skills</span>
                    <span className="absolute top-1/2 left-0 -translate-x-8 -translate-y-1/2 text-[10px] font-black uppercase tracking-tighter text-zinc-400">Coding</span>
                  </div>

                  <div className="space-y-4">
                    {analyticsData.map((category, idx) => (
                      <div key={category.name} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{category.name}</span>
                           <span className="text-xs font-black text-white">{category.score}%</span>
                        </div>
                        <div className="h-2 bg-zinc-950/50 rounded-full overflow-hidden border border-white/5">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-primary-100' : idx === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}
                            style={{ width: `${category.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-primary-100/5 rounded-xl border border-primary-100/10 flex items-start gap-4">
                    <TrendingUp className="w-6 h-6 text-primary-200 shrink-0 mt-0.5" />
                    <p className="text-sm text-light-100 leading-relaxed">
                      {analyticsData.length > 0 ? (
                        <>
                          You are performing strongest in <strong className="text-white">{analyticsData[0].name}</strong> with a score of {analyticsData[0].score}%.
                          {analyticsData.length > 1 && (
                            <> Focus on improving your <strong className="text-white">{analyticsData[analyticsData.length - 1].name}</strong> ({analyticsData[analyticsData.length - 1].score}%) to maximize your overall interview readiness.</>
                          )}
                        </>
                      ) : (
                        "Analyze your interview feedback to see personalized performance insights here."
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-dark-300 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-light-400 opacity-50" />
                  </div>
                  <p className="text-white font-bold mb-2">No Analytics Available</p>
                  <p className="text-light-200 text-sm max-w-sm">Complete at least one mock interview to unlock your personalized performance analytics and skill radar.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Interviews Card */}
          <div className="border-gradient p-0.5 rounded-[2rem] w-full">
            <div className="bg-zinc-900 shadow-2xl rounded-[1.9rem] p-6 md:p-10 flex flex-col">
              <div className="mb-8 border-b border-white/5 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase tracking-tight">Interviews</h3>
                  <p className="text-zinc-500 text-sm md:text-base font-medium">Your latest mock interview sessions</p>
                </div>
                <Link href="/" className="text-primary-100 hover:text-white text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1 transition-colors group">
                  View All Sessions <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {interviews && interviews.length > 0 ? (
                  interviews.slice(0, 5).map((interview) => {
                    const feedback = validFeedbacks.find(f => f.interviewId === interview.id);
                    return (
                      <div
                        key={interview.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-dark-300/40 border border-light-400/10 hover:border-primary-100/40 hover:bg-dark-300/80 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl shadow-inner ${interview.finalized ? 'bg-success-100/20 text-success-100' : 'bg-primary-100/20 text-primary-100'}`}>
                            {interview.finalized ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white group-hover:text-primary-100 transition-colors">
                              {interview.role} <span className="text-primary-200 font-medium text-xs ml-1 px-2 py-0.5 rounded-full bg-primary-200/10">{interview.level}</span>
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-light-200">
                                {new Date(interview.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                              {interview.finalized && feedback && (
                                <span className="text-xs font-bold text-success-100 flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-current" /> {feedback.totalScore}/100
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 sm:mt-0">
                          {interview.finalized ? (
                            <Link
                              href={`/interview/${interview.id}/feedback`}
                              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-dark-100 bg-primary-200 rounded-full hover:bg-primary-100 transition-colors w-full sm:w-auto"
                            >
                              View Feedback <ArrowRight className="ml-1.5 w-4 h-4" />
                            </Link>
                          ) : (
                            <Link
                              href={`/interview/${interview.id}`}
                              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary-200 bg-dark-200 border border-primary-200/30 rounded-full hover:bg-primary-200/10 transition-colors w-full sm:w-auto"
                            >
                              Resume
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-light-200 mb-4">You haven&apos;t taken any mock interviews.</p>
                    <Link href="/interview" className="btn-primary inline-flex">
                      Start an Interview
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Quizzes Card */}
          <div className="border-gradient p-0.5 rounded-[2rem] w-full">
            <div className="bg-zinc-900 shadow-2xl rounded-[1.9rem] p-6 md:p-10 flex flex-col">
              <div className="mb-8 border-b border-white/5 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase tracking-tight">Quiz History</h3>
                  <p className="text-zinc-500 text-sm md:text-base font-medium">Your latest practice quiz results</p>
                </div>
                <Link href="/quiz" className="text-primary-100 hover:text-white text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1 transition-colors group">
                  Practice More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {quizResults && quizResults.length > 0 ? (
                  quizResults.slice(0, 5).map((result) => {
                    const quizMetadata = userQuizzes?.find(q => q.id === result.quizId);
                    const percentage = Math.round((result.score / result.totalQuestions) * 100);
                    
                    return (
                      <div
                        key={result.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-dark-300/40 border border-light-400/10 hover:border-primary-200/40 hover:bg-dark-300/80 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-xl bg-primary-200/20 text-primary-200 shadow-inner">
                            <BookOpen size={24} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white group-hover:text-primary-200 transition-colors">
                              {quizMetadata?.role || "Technical Quiz"} <span className="text-primary-200 font-medium text-xs ml-1 px-2 py-0.5 rounded-full bg-primary-200/10">{quizMetadata?.level || "General"}</span>
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-light-200">
                                {new Date(result.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                              <span className={`text-xs font-bold flex items-center gap-1 ${percentage >= 70 ? 'text-success-100' : 'text-amber-400'}`}>
                                <Trophy className="w-3 h-3" /> {result.score}/{result.totalQuestions} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 sm:mt-0">
                          <Link
                            href={`/quiz/${result.quizId}`}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary-200 bg-dark-200 border border-primary-200/30 rounded-full hover:bg-primary-200/10 transition-colors w-full sm:w-auto"
                          >
                            Retake Quiz <RotateCcw className="ml-1.5 w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-light-200 mb-4">No quiz results found.</p>
                    <Link href="/quiz" className="btn-secondary inline-flex">
                      Practice with Quizzes
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
