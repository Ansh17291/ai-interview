import { getQuizzes } from "@/lib/actions/general.action";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, BookOpen, Building2 } from "lucide-react";
import DisplayTechIcons from "@/components/DisplayTechIcons";

export default async function QuizPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="flex flex-col gap-8">
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg text-white">
          <h2 className="text-3xl font-bold">Quiz Section</h2>
          <p className="text-lg text-zinc-300">
            Take generic quizzes or company-specific mock tests to sharpen your technical skills.
          </p>

          <Button asChild className="btn-primary max-sm:w-full w-fit gap-2">
            <Link href="/quiz/new">
              <Plus className="w-5 h-5" /> Generate New Quiz
            </Link>
          </Button>
        </div>

        <div className="hidden md:flex items-center justify-center p-4">
          <BookOpen className="w-32 h-32 text-blue-500 opacity-20" />
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-4">
        <h2 className="text-2xl font-bold text-white">Available Quizzes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes && quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <Link href={`/quiz/${quiz.id}`} key={quiz.id}>
                <Card className="p-6 bg-zinc-900 border-zinc-800 text-white hover:border-blue-500 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-zinc-800 group-hover:bg-blue-600/20 transition-all">
                      <BookOpen className="w-6 h-6 text-blue-500" />
                    </div>
                    {quiz.company && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-700">
                        <Building2 className="w-3 h-3" />
                        {quiz.company}
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-1 truncate">{quiz.title}</h3>
                  <p className="text-zinc-400 text-sm mb-4">{quiz.role} • {quiz.level}</p>

                  <div className="flex items-center justify-between mt-auto">
                    <DisplayTechIcons techStack={quiz.techstack} />
                    <span className="text-xs text-zinc-500">
                      {quiz.questions.length} Questions
                    </span>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-3xl">
              <p>No quizzes available yet. Generate your first quiz!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
