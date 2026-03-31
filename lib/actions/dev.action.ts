"use server";

import { db } from "@/firebase/admin";
import { dummyInterviews, SAMPLE_QUIZZES } from "@/constants";
import { revalidatePath } from "next/cache";

/**
 * Syncs high-quality dummy data to a specific user for testing purposes.
 * This includes interview history with transcripts and quiz results.
 */
export async function syncTechnicalDummyData(userId: string) {
  try {
    console.log(`Syncing dummy data for user: ${userId}`);

    // High quality interview transcripts to make the AI resume generation look real
    const technicalInterviews = [
      {
        role: "Senior Full Stack Developer",
        techstack: ["React", "Node.js", "PostgreSQL", "Next.js"],
        level: "Mid-Level",
        type: "Technical",
        score: 85,
        transcript: [
          { role: "interviewer", content: "Hello! Can you tell me about your experience with React server components?" },
          { role: "user", content: "I have used RSCs in several Next.js 14 projects to improve initial load times and reduce client-side bundle size." },
          { role: "interviewer", content: "That's great. How do you handle data fetching in that context?" },
          { role: "user", content: "Since RSCs are server-side, I fetch data directly within the component using async/await, often with Prisma or directly from an API." }
        ],
        feedback: "Strong technical foundations. High hire recommendation.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      },
      {
        role: "Frontend Engineer",
        techstack: ["TypeScript", "Tailwind CSS", "Redux"],
        level: "Senior",
        type: "Technical",
        score: 92,
        transcript: "Mastery of TypeScript generics and narrow typing. Built a responsive UI component live. Discussed state management tradeoffs between Redux and Context API effectively.",
        feedback: "Excellent frontend skills. Top 5% candidate.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      }
    ];

    // Add interviews
    for (const interview of technicalInterviews) {
      await db.collection("interviews").add({
        ...interview,
        userId,
        finalized: true,
        updatedAt: interview.createdAt,
      });
    }

    // Add some quiz results
    const technicalQuizzes = [
      {
        title: "React Modern Patterns Quiz",
        score: 90,
        totalQuestions: 10,
        role: "React",
        level: "Advanced",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      },
      {
        title: "Node.js Backend Essentials",
        score: 80,
        totalQuestions: 10,
        role: "Node.js",
        level: "Mid-Level",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      }
    ];

    for (const quiz of technicalQuizzes) {
      await db.collection("quizResults").add({
        ...quiz,
        userId,
        updatedAt: quiz.createdAt,
      });
    }

    revalidatePath("/");
    return { success: true, message: "Technical history synchronized successfully!" };
  } catch (error) {
    console.error("Error syncing dummy data:", error);
    return { success: false, error: "Failed to sync data" };
  }
}
