"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { z } from "zod";

// Schema for JD analysis
const jdAnalysisSchema = z.object({
  role: z.string(),
  company: z.string().optional(),
  level: z.string().describe("Junior, Mid-level, Senior, or Lead"),
  primarySkills: z.array(z.string()),
  softSkills: z.array(z.string()),
  briefSummary: z.string(),
  likelyQuestions: z.array(z.string()).describe("5-7 likely interview questions based on this JD"),
  companyValues: z.array(z.string()).optional(),
});

export type JDAnalysis = z.infer<typeof jdAnalysisSchema>;

/**
 * Analyzes a raw Job Description and extracts key structured data.
 */
export async function analyzeJobDescription(jdText: string): Promise<{ success: boolean; data?: JDAnalysis; error?: string }> {
  if (!jdText || jdText.trim().length < 50) {
    return { success: false, error: "Job description is too short to analyze." };
  }

  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: jdAnalysisSchema,
      prompt: `
        Analyze the following Job Description (JD) text and extract structured information.
        Be thorough in identifying technical requirements and soft skills.
        Generate 5-7 realistic, role-specific interview questions that a candidate might face for this position.

        JD Text:
        ${jdText}
      `,
    });

    return { success: true, data: object };
  } catch (error) {
    console.error("Error analyzing JD:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to analyze job description." 
    };
  }
}

/**
 * Saves a JD for a user in Firestore.
 */
export async function saveUserJD(userId: string, jdText: string, analysis: JDAnalysis) {
  try {
    const docRef = await db.collection("job_descriptions").add({
      userId,
      rawText: jdText,
      analysis,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving JD:", error);
    return { success: false };
  }
}

/**
 * Fetches the latest JDs for a user.
 */
export async function getUserJDs(userId: string) {
  try {
    const snapshot = await db.collection("job_descriptions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching user JDs:", error);
    return [];
  }
}
