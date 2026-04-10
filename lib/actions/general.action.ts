"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema, interviewMetadataSchema, quizSchema, SAMPLE_QUIZZES, dummyInterviews } from "@/constants";
import { Interview, Feedback, CreateFeedbackParams, GetFeedbackByInterviewIdParams, GetLatestInterviewsParams, SaveQuizResultParams, QuizResult, Quiz } from "@/types";

type TranscriptEntry = { role: string; content: string };

type RawTranscriptRecord = {
  level: string;
  id: string;
  interviewId?: string;
  role?: string;
  type?: string;
  techStack?: string[];
  createdAt: string;
  userId: string;
  transcript?: TranscriptEntry[];
  numQuestions?: number;
  score?: number;
  summary?: string;
};

export async function saveTranscript(params: { userId: string; interviewId?: string; transcript: TranscriptEntry[]; type: string }) {
  const { userId, interviewId, transcript, type } = params;
  try {
    let metadata = {};

    if (type === "generate") {
      const formattedTranscript = transcript
        .map(
          (sentence: { role: string; content: string }) =>
            `- ${sentence.role}: ${sentence.content}\n`
        )
        .join("");

      try {
        const { object } = await generateObject({
          model: google("gemini-2-flash-latest"),
          schema: interviewMetadataSchema,
          prompt: `
            Analyze the following transcript from an AI interview session and extract the following details:
            - Role being interviewed for
            - Level (e.g., Junior, Mid-level, Senior)
            - Type of interview (e.g., Technical, Behavioral, Mixed)
            - Tech Stack discussed (list of technologies)
            - Number of questions asked by the interviewer
            - Score: Evaluate the candidate's performance and provide a score out of 100.
            - Summary: A very brief summary of the interview in exactly 6-7 words.

            Transcript:
            ${formattedTranscript}
          `,
        });
        metadata = object;
      } catch (aiError) {
        console.error("Error extracting metadata with AI:", aiError);
        // Fallback metadata if AI fails
        metadata = {
          role: "AI Generation Session",
          level: "N/A",
          type: "General",
          techStack: [],
          numQuestions: 0,
          score: 0,
          summary: "Session completed with no summary generated."
        };
      }
    }

    const data = {
      userId,
      interviewId: interviewId || null,
      transcript,
      type,
      ...metadata,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("transcripts").add(data);
    console.log("Raw transcript saved successfully with id:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving raw transcript:", error);
    return { success: false };
  }
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;
  console.log("createFeedback called for interviewId:", interviewId);

  // 1. Save the transcript to the raw transcripts collection for history
  try {
    await saveTranscript({
      userId,
      interviewId,
      transcript,
      type: "interview",
    });
    console.log("Raw transcript saved to transcripts collection.");
  } catch (err) {
    console.error("Error saving raw transcript to collection:", err);
  }

  // 2. Immediately save the transcript to the interview document for tracking
  if (interviewId) {
    try {
      await db.collection("interviews").doc(interviewId).update({
        transcript: transcript,
        updatedAt: new Date().toISOString(),
      });
      console.log("Interview document updated with transcript.");
    } catch (err) {
      console.error("Error updating interview doc with transcript:", err);
    }
  }

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    if (!formattedTranscript) {
      console.warn("No transcript found for feedback generation.");
    }

    const { object } = await generateObject({
      model: google("gemini-2-flash-latest"), 
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please evaluate the candidate in the following areas (score 0-100):
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem Solving**: Ability to analyze problems and propose solutions.
        - **Cultural Fit**: Alignment with company values and job role.
        - **Confidence and Clarity**: Confidence in responses, engagement, and clarity.

        Additionally:
        - Identify 3-5 key strengths.
        - Identify 3-5 areas for improvement.
        - Extract 5-7 performance highlights or key points discussed.
        - Provide a final assessment summary (2-3 sentences).
        - Give a clear recommendation: "Strong Hire", "Hire", "Leaning Hire", "Leaning No Hire", or "No Hire".
        - Assess technical depth (0-100).
        - Identify 3-5 behavioral traits observed (e.g., "Analytical", "Proactive", "Resilient").
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    // Manually calculate total score for accuracy
    const calculatedTotalScore = Math.round(
      object.categoryScores.reduce((acc, cat) => acc + cat.score, 0) / object.categoryScores.length
    );

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: calculatedTotalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      keyPoints: object.keyPoints,
      transcript: transcript,
      finalAssessment: object.finalAssessment,
      recommendation: object.recommendation,
      technicalDepth: object.technicalDepth,
      behavioralTraits: object.behavioralTraits,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);
    console.log("Feedback saved successfully with id:", feedbackRef.id);

    // Update interview doc with keyPoints as well
    if (interviewId) {
      await db.collection("interviews").doc(interviewId).update({
        keyPoints: object.keyPoints,
        finalized: true,
      }).catch(err => console.error("Error updating interview keyPoints:", err));
    }

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error: unknown) {
    console.error("Error saving feedback:", error);
    let errorMessage = "An unexpected error occurred.";

    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      if ('statusCode' in error && typeof error.statusCode === 'number') {
        if (errorMessage.includes("quota") || error.statusCode === 429) {
          errorMessage = "API quota exceeded. Please try again later.";
        }
      } else if (errorMessage.includes("quota")) {
         errorMessage = "API quota exceeded. Please try again later.";
      }
    }

    return { success: false, error: errorMessage };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  // 1. Try to fetch from 'interviews' collection
  const interviewDoc = await db.collection("interviews").doc(id).get();

  if (interviewDoc.exists) {
    return { id: interviewDoc.id, ...interviewDoc.data() } as Interview;
  }

  // 2. Fallback: Try to fetch from 'transcripts' collection (for standalone AI sessions)
  const transcriptDoc = await db.collection("transcripts").doc(id).get();

  if (transcriptDoc.exists) {
    const t = transcriptDoc.data() as RawTranscriptRecord;
    return {
      id: transcriptDoc.id,
      role: t.role || (t.type === "generate" ? "AI Generation Session" : "AI Conversation"),
      level: t.level || "N/A",
      type: t.type || "General",
      techstack: t.techStack || [],
      createdAt: t.createdAt,
      userId: t.userId,
      finalized: true,
      questions: t.numQuestions ? Array(t.numQuestions).fill("AI Generated Question") : [],
      numQuestions: t.numQuestions,
      score: t.score,
      summary: t.summary,
      transcript: t.transcript,
    } as Interview;
  }

  const systemPreset = dummyInterviews.find(i => i.id === id);
  if (systemPreset) return systemPreset as Interview;

  // 3. Fallback: Check if it's a predefined interview
  if (id.startsWith("predefined_")) {
    const originalId = id.replace("predefined_", "");
    const preset = dummyInterviews.find(i => i.id === originalId);
    if (preset) return preset as Interview;
  }

  console.error("Interview not found with id:", id);
  return null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  // Ensure userId is available before querying
  if (!userId) {
    console.error("userId is required for getFeedbackByInterviewId");
    // Depending on requirements, you might throw an error or return null/default
    return null;
  }

  try {
    const querySnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) return null;

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
  } catch (error) {
    console.error("Error getFeedbackByInterviewId:", error);
    return null;
  }
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  // Ensure userId is available for the query
  if (!userId) {
    console.error("userId is required for getLatestInterviews");
    return null; // Or throw an error
  }

  try {
      const interviews = await db
        .collection("interviews")
        .orderBy("createdAt", "desc")
        .where("finalized", "==", true)
        .limit(limit)
        .get();

      return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Interview[];
  } catch (error) {
      console.error("Error getLatestInterviews:", error);
      return [];
  }
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching interviews by userId:", error);
    return [];
  }
}

export async function getCompletedInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    // 1. Fetch all transcripts, interviews, and feedbacks for this user
    const [transcriptsSnap, interviewsSnap, feedbacksSnap] = await Promise.all([
      db.collection("transcripts").where("userId", "==", userId).orderBy("createdAt", "desc").get(),
      db.collection("interviews").where("userId", "==", userId).get(),
      db.collection("feedback").where("userId", "==", userId).get(),
    ]);

    if (transcriptsSnap.empty) return [];

    const transcripts = transcriptsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RawTranscriptRecord[];

    const interviewsMap = new Map(
      interviewsSnap.docs.map((doc) => [doc.id, { id: doc.id, ...doc.data() }])
    );

    const feedbacksMap = new Map(
      feedbacksSnap.docs.map((doc) => [doc.get("interviewId"), doc.data()])
    );

    // 3. Map transcripts to interviews, providing fallbacks for standalone sessions
    const completedInterviews = transcripts
      .map((t) => {
        const interview = t.interviewId ? interviewsMap.get(t.interviewId) : null;
        const feedback = t.interviewId ? feedbacksMap.get(t.interviewId) : null;
        
        if (!interview) {
          // Use AI-extracted metadata if available, otherwise fallback
          const fallbackInterview: Interview = {
            id: t.interviewId || t.id,
            role: t.role || (t.type === "generate" ? "AI Generation Session" : "AI Conversation"),
            level: t.level || "N/A",
            type: t.type || "General",
            techstack: t.techStack || [],
            createdAt: t.createdAt,
            userId: t.userId,
            finalized: true,
            questions: t.numQuestions ? Array(t.numQuestions).fill("AI Generated Question") : [],
            numQuestions: t.numQuestions,
            score: t.score || (feedback ? feedback.totalScore : null),
            summary: t.summary,
          };

          return fallbackInterview;
        }

        return {
          ...interview,
          transcript: t.transcript,
          createdAt: t.createdAt,
          id: t.interviewId,
          techstack: interview.techstack || t.techStack || [],
          numQuestions: t.numQuestions || interview.questions?.length,
          score: t.score || (feedback ? feedback.totalScore : interview.score),
          summary: t.summary || interview.summary,
        } as Interview;
      })
      .filter((i) => i !== null) as Interview[];

    return completedInterviews;
  } catch (error) {
    console.error("Error fetching completed interviews from transcripts:", error);
    return [];
  }
}

export async function getUserStats(userId: string) {
  try {
    const [interviews, completed, quizzes, quizResults] = await Promise.all([
      getInterviewsByUserId(userId),
      getCompletedInterviewsByUserId(userId),
      getQuizzesByUserId(userId),
      getQuizResultsByUserId(userId),
    ]);

    const userInterviews = interviews ?? [];
    const completedInterviews = completed ?? [];
    const userQuizzes = quizzes ?? [];
    const userQuizResults = quizResults ?? [];

    // Separate planned interviews from standalone ones
    const standaloneInterviewsCount = completedInterviews.filter(ci => 
      !userInterviews.some(ui => ui.id === ci.id)
    ).length;

    const totalInterviewsCount = userInterviews.length + standaloneInterviewsCount;

    // Calculate average score from all completed interviews that have a score
    const interviewsWithScore = completedInterviews.filter(i => i.score !== undefined && i.score !== null);
    const averageInterviewScore = interviewsWithScore.length > 0
      ? interviewsWithScore.reduce((acc, i) => acc + (i.score || 0), 0) / interviewsWithScore.length
      : 0;

    // Calculate average score from quizzes
    const averageQuizScore = userQuizResults.length > 0
      ? userQuizResults.reduce((acc, qr) => acc + (qr.score / qr.totalQuestions) * 100, 0) / userQuizResults.length
      : 0;

    // Weighted average score
    let averageScore = 0;
    if (averageInterviewScore > 0 && averageQuizScore > 0) {
      averageScore = Math.round((averageInterviewScore + averageQuizScore) / 2);
    } else {
      averageScore = Math.round(averageInterviewScore || averageQuizScore);
    }

    return {
      totalInterviews: totalInterviewsCount,
      completedInterviews: completedInterviews.length,
      totalQuizzes: userQuizzes.length,
      averageScore,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      totalInterviews: 0,
      completedInterviews: 0,
      totalQuizzes: 0,
      averageScore: 0,
    };
  }
}

export async function saveQuizResult(params: SaveQuizResultParams) {
  try {
    const { quizId, userId, score, totalQuestions, userAnswers } = params;
    
    const result = {
      quizId,
      userId,
      score,
      totalQuestions,
      userAnswers,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("quiz_results").add(result);
    console.log("Quiz result saved successfully with id:", docRef.id);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return { success: false };
  }
}

export async function getQuizResultsByUserId(userId: string): Promise<QuizResult[]> {
  try {
    const results = await db
      .collection("quiz_results")
      .where("userId", "==", userId)
      .get();

    const quizResults = results.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuizResult[];

    // Sort in memory to avoid requiring a composite index immediately
    return quizResults.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return [];
  }
}

export async function generateQuiz(params: {
  role: string;
  level: string;
  techstack: string[];
  userId: string;
  company?: string;
  amount: number;
}) {
  const { role, level, techstack, userId, company, amount } = params;

  try {
    const { object } = await generateObject({
      model: google("gemini-2-flash-latest"),
      schema: quizSchema,
      prompt: `
        Generate a quiz for a ${level} ${role} role${
        company ? ` at ${company}` : ""
      }.
        The tech stack includes: ${techstack.join(", ")}.
        Provide ${amount} multiple-choice questions with 4 options each and the index of the correct answer (0-3).
        The questions should be challenging and relevant to the role and tech stack.
        ${
          company
            ? `Include some questions specifically related to common interview questions at ${company} for this role.`
            : ""
        }
      `,
    });

    const quiz = {
      ...object,
      role,
      level,
      techstack,
      userId,
      company: company || null,
      createdAt: new Date().toISOString(),
    };

    const quizRef = await db.collection("quizzes").add(quiz);

    return { success: true, quizId: quizRef.id };
  } catch (error: unknown) { // Changed 'any' to 'unknown' for better type safety
    console.error("Error generating quiz:", error);
    let errorMessage = "An unexpected error occurred.";

    // Safely access error properties
    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      // Check for specific properties like statusCode if the error object structure is known
      if ('statusCode' in error && typeof error.statusCode === 'number') {
        if (errorMessage.includes("quota") || error.statusCode === 429) {
          errorMessage = "API quota exceeded. Please try again later.";
        }
      } else if (errorMessage.includes("quota")) {
         // Fallback for quota errors if statusCode is not available but message indicates it
         errorMessage = "API quota exceeded. Please try again later.";
      }
    }

    return { success: false, error: errorMessage };
  }
}

export async function getQuizzes(): Promise<Quiz[] | null> {
  const quizzes = await db
    .collection("quizzes")
    .orderBy("createdAt", "desc")
    .get();

  return quizzes.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Quiz[];
}

export async function getQuizzesByUserId(
  userId: string
): Promise<Quiz[] | null> {
  try {
    const quizzes = await db
      .collection("quizzes")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return quizzes.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Quiz[];
  } catch (error) {
    console.error("Error fetching quizzes by userId:", error);
    return [];
  }
}

export async function getFeedbackByUserId(
  userId: string
): Promise<Feedback[] | null> {
  try {
    const feedbacks = await db
      .collection("feedback")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return feedbacks.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Feedback[];
  } catch (error) {
    console.error("Error fetching feedback by userId:", error);
    return [];
  }
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  const sampleQuiz = SAMPLE_QUIZZES.find((q) => q.id === id);
  if (sampleQuiz) return sampleQuiz as Quiz;

  const quiz = await db.collection("quizzes").doc(id).get();

  if (!quiz.exists) return null;

  return { id: quiz.id, ...quiz.data() } as Quiz;
}
