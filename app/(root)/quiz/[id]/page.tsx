import { getQuizById } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Quiz from "@/components/Quiz";
import { notFound, redirect } from "next/navigation";

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const quiz = await getQuizById(id);

  if (!quiz) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Quiz quiz={quiz} userId={user.id} />
    </div>
  );
}
