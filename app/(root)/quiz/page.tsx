import { getQuizzes } from "@/lib/actions/general.action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Building2, Zap, BrainCircuit, ShieldCheck, Target } from "lucide-react";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { cn } from "@/lib/utils";

export default async function QuizPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl space-y-16 animate-in fade-in duration-1000">
      
      {/* Immersive Header Section */}
      <div className="relative group overflow-hidden rounded-[2.5rem] md:rounded-[3rem] border border-white/10 bg-zinc-950 p-[2px] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/10 opacity-50"></div>
        <div className="relative bg-zinc-950 rounded-[2.4rem] p-10 md:p-16 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Background Detail */}
          <div className="absolute top-0 right-0 p-20 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="space-y-6 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
               <BrainCircuit className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Cognitive Evaluation Engine</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none flex flex-col">
              <span>TECHNICAL</span>
              <span className="text-blue-500">MASTERY.</span>
            </h1>
            <p className="text-zinc-400 text-base md:text-xl max-w-xl font-medium leading-relaxed">
              Verify your technical depth with AI-generated psychometric tests. Adaptive difficulty logic tuned for top 1% talent.
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
               <Link href="/quiz/new" className="w-full md:w-auto">
                 <Button className="w-full md:w-auto h-16 px-10 bg-white text-zinc-950 hover:bg-blue-500 hover:text-white transition-all duration-500 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl group flex items-center gap-3">
                   <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> GENERATE EVALUATION
                 </Button>
               </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
             <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
             <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] shadow-2xl ring-1 ring-white/5">
                <BookOpen className="w-32 h-32 text-blue-500" />
             </div>
          </div>
        </div>
      </div>

      {/* Quiz Grid Section */}
      <section className="space-y-10 relative">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
               <div className="w-8 h-[1px] bg-blue-500/50"></div>
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Evaluation Repository</span>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">ACTIVE MODULES</h2>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
             <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> REAL-TIME FEED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes && quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <Link href={`/quiz/${quiz.id}`} key={quiz.id} className="group relative">
                <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-[0.03] blur-3xl transition-opacity duration-500"></div>
                <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all duration-500 h-full relative overflow-hidden flex flex-col hover:shadow-2xl">
                  
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 text-blue-500 shadow-xl group-hover:ring-4 ring-blue-500/10 transition-all">
                      <Zap className="w-6 h-6" />
                    </div>
                    {quiz.company ? (
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-[9px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                        <Building2 className="w-3 h-3" />
                        {quiz.company}
                      </div>
                    ) : (
                       <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest border border-white/5 px-3 py-1.5 rounded-full bg-white/5">General Module</span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-blue-400 transition-colors leading-tight">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-4 mb-8">
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-blue-500" /> {quiz.level} Tier
                     </span>
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Adaptive Difficulty
                     </span>
                  </div>
                  
                  <div className="flex-1 bg-zinc-950/50 rounded-2xl p-4 border border-white/5 mb-8 text-[11px] font-medium text-zinc-500 uppercase tracking-tight italic opacity-60">
                     Technical profiling for {quiz.role} including core fundamentals and depth signals...
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                    <div className="flex items-center gap-3">
                       <DisplayTechIcons techStack={quiz.techstack} />
                    </div>
                    <div className="text-right">
                       <span className="block text-2xl font-black text-white tracking-tighter leading-none">{quiz.questions.length}</span>
                       <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">SIGNS</span>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                     <Button className="w-full h-12 bg-zinc-950 hover:bg-white text-white hover:text-zinc-950 border border-white/5 hover:border-transparent font-black uppercase tracking-widest text-[10px] rounded-xl transition-all">
                        ENTER PROTOCOL
                     </Button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-zinc-900/50 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center gap-4">
              <div className="p-4 bg-white/5 rounded-full"><Zap className="w-8 h-8 text-zinc-600" /></div>
              <p className="text-zinc-500 font-bold uppercase tracking-widest">No active modules. System ready for deployment.</p>
              <Link href="/quiz/new">
                 <Button variant="ghost" className="text-blue-400 text-xs font-black uppercase">Initialize Module &rarr;</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
