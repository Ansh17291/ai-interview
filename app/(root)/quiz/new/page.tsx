import { getCurrentUser } from "@/lib/actions/auth.action";
import QuizForm from "@/components/QuizForm";
import { redirect } from "next/navigation";

export default async function NewQuizPage() {
  const user = await getCurrentUser();

  // ✅ Safe auth check
  if (!user || !user.id) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col gap-6">
      <h3>Interview generation</h3>
      <QuizForm userId={user.id} />
    </div>
  );
}