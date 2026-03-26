import HomePageClient from "./HomePageClient"; // Import the new Client Component
import LandingPage from "@/components/LandingPage";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
  getCompletedInterviewsByUserId,
  getQuizzesByUserId,
  getFeedbackByUserId,
  getUserStats,
} from "@/lib/actions/general.action";
import InterviewCard from "@/components/InterviewCard";

async function Home() {
  const user = await getCurrentUser();

  // Show landing page if user is not logged in
  if (!user || !user.id) {
    return <LandingPage />;
  }

  // Fetch data server-side using safe user.id
  const [
    userInterviews,
    allInterview,
    completedInterviews,
    quizzes,
    feedbacks,
    stats,
  ] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
    getCompletedInterviewsByUserId(user.id),
    getQuizzesByUserId(user.id),
    getFeedbackByUserId(user.id),
    getUserStats(user.id),
  ]).then(async ([interviews, latest, completed, q, f, s]) => {
    return [
      (interviews ?? []) as Interview[],
      (latest ?? []) as Interview[],
      (completed ?? []) as Interview[],
      (q ?? []) as Quiz[],
      (f ?? []) as Feedback[],
      await s,
    ] as const;
  });

  const feedbacksMap = (feedbacks as Feedback[]).reduce((acc, f) => {
    acc[f.interviewId] = f;
    return acc;
  }, {} as Record<string, Feedback>);

  const userInterviewsNode = userInterviews.length > 0 ? (
    userInterviews.map((interview) => (
      <InterviewCard
        key={interview.id}
        userId={user.id}
        interviewId={interview.id}
        role={interview?.role}
        level={interview?.level}
        type={interview?.type}
        techstack={interview?.techstack}
        createdAt={interview?.createdAt}
        questionsCount={interview?.numQuestions || interview?.questions?.length}
        score={interview?.score}
        summary={interview?.summary}
      />
    ))
  ) : (
    <p>You haven&#x27;t taken any interviews yet</p>
  );

  const allInterviewNode = allInterview.length > 0 ? (
    allInterview.map((interview) => (
      <InterviewCard
        key={interview.id}
        userId={user.id}
        interviewId={interview.id}
        role={interview.role}
        level={interview.level}
        type={interview.type}
        techstack={interview.techstack}
        createdAt={interview.createdAt}
        questionsCount={interview.numQuestions || interview.questions?.length}
        score={interview.score}
        summary={interview.summary}
      />
    ))
  ) : (
    <p>There are no interviews available</p>
  );

  const completedInterviewsNode = completedInterviews.length > 0 ? (
    completedInterviews.map((interview) => (
      <InterviewCard
        key={interview.id}
        userId={user.id}
        interviewId={interview.id}
        role={interview.role}
        level={interview.level}
        type={interview.type}
        techstack={interview.techstack}
        createdAt={interview.createdAt}
        questionsCount={interview.numQuestions || interview.questions?.length}
        score={interview.score}
        summary={interview.summary}
      />
    ))
  ) : (
    <p>You haven&#x27;t completed any interviews yet</p>
  );

  return (
    <>
      <HomePageClient
        user={user}
        userInterviews={userInterviews}
        allInterview={allInterview}
        userInterviewsNode={userInterviewsNode}
        allInterviewNode={allInterviewNode}
        completedInterviewsNode={completedInterviewsNode}
        stats={stats}
        feedbacksMap={feedbacksMap}
      />
    </>
  );
}

export default Home;
