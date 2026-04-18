"use server";

import { db } from "@/firebase/admin";
import { revalidatePath } from "next/cache";
import { generateResumeInsights } from "@/lib/services/resumeParser";
import { Resume, ResumeEducation, ResumeExperience, CareerPath, UserLearningProgress } from "@/types";

// --- RESUME OPERATIONS ---
export async function createResume(data: {
  userId: string;
  title: string;
  personalInfo: Resume["personalInfo"];
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  certifications: string[];
}) {
  try {
    const resumeText = `${data.title}\n\nSummary:\n${data.summary}\n\nExperience:\n${data.experience.map(e => `${e.position} at ${e.companyName}\n${e.description}`).join("\n")}\n\nSkills:\n${data.skills.join(", ")}`;
    const insightsResult = await generateResumeInsights(resumeText);
    
    const newResume = {
      ...data,
      insights: insightsResult.success ? insightsResult.insights : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await db.collection("resumes").add(newResume);
    revalidatePath("/resume");
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function updateResume(resumeId: string, data: Partial<Resume>) {
  try {
    const resumeDoc = await db.collection("resumes").doc(resumeId).get();
    const currentData = resumeDoc.data();
    
    // Generate new insights if relevant fields changed
    const resumeText = `${data.title || currentData?.title}\n\nSummary:\n${data.summary || currentData?.summary}\n\nExperience:\n${(data.experience || currentData?.experience || []).map((e: any) => `${e.position} at ${e.companyName}\n${e.description}`).join("\n")}\n\nSkills:\n${(data.skills || currentData?.skills || []).join(", ")}`;
    
    const insightsResult = await generateResumeInsights(resumeText);

    await db
      .collection("resumes")
      .doc(resumeId)
      .update({
        ...data,
        insights: insightsResult.success ? insightsResult.insights : currentData?.insights,
        updatedAt: new Date().toISOString(),
      });
    revalidatePath("/resume");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function getUserResumes(userId: string) {
  try {
    const snapshot = await db
      .collection("resumes")
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<Resume & { id: string }>;
  } catch (error: unknown) {
    console.error("Failed to get user resumes", error);
    return [];
  }
}

export async function getResumeById(resumeId: string) {
  try {
    const doc = await db.collection("resumes").doc(resumeId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Resume & { id: string };
  } catch (error: unknown) {
    console.error("Failed to get resume", error);
    return null;
  }
}

export async function deleteResume(resumeId: string) {
  try {
    await db.collection("resumes").doc(resumeId).delete();
    revalidatePath("/resume");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

// --- CAREER PATH OPERATIONS ---
export async function getCareerPathByRole(role: string) {
  try {
    const snapshot = await db
      .collection("career_paths")
      .where("role", "==", role)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as CareerPath & { id: string };
  } catch (error: unknown) {
    console.error("Failed to get career path", error);
    return null;
  }
}

export async function getAllCareerPaths() {
  try {
    const snapshot = await db
      .collection("career_paths")
      .orderBy("role", "asc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<CareerPath & { id: string }>;
  } catch (error: unknown) {
    console.error("Failed to get career paths", error);
    return [];
  }
}

export async function getUserLearningProgress(
  userId: string,
  careerPathId: string
) {
  try {
    const snapshot = await db
      .collection("user_learning_progress")
      .where("userId", "==", userId)
      .where("careerPathId", "==", careerPathId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserLearningProgress & {
      id: string;
    };
  } catch (error: unknown) {
    console.error("Failed to get user progress", error);
    return null;
  }
}

export async function createOrUpdateLearningProgress(data: {
  userId: string;
  careerPathId: string;
  role: string;
  completedSteps?: number;
  completedCourses?: string[];
  currentStep?: number;
  progress?: number;
}) {
  try {
    const existing = await getUserLearningProgress(
      data.userId,
      data.careerPathId
    );

    if (existing) {
      await db
        .collection("user_learning_progress")
        .doc(existing.id)
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        });
      return { success: true, id: existing.id };
    } else {
      const newProgress = {
        ...data,
        completedSteps: data.completedSteps || 0,
        completedCourses: data.completedCourses || [],
        currentStep: data.currentStep || 1,
        progress: data.progress || 0,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const docRef = await db
        .collection("user_learning_progress")
        .add(newProgress);
      return { success: true, id: docRef.id };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function createCareerPath(data: CareerPath) {
  try {
    const docRef = await db.collection("career_paths").add(data);
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
