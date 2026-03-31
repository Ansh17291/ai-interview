"use server";

import { db } from "@/firebase/admin";
import { CareerPath, UserLearningProgress } from "@/types/index";
import { revalidatePath } from "next/cache";

/**
 * Save generated career path to Firestore for a user
 */
export async function saveUserCareerPath(userId: string, roadmap: Partial<CareerPath>) {
  try {
    const newRoadmap = {
      ...roadmap,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await db.collection("career_paths").add(newRoadmap);
    
    // Create initial user learning progress tracker
    const progressData: Partial<UserLearningProgress> = {
      userId,
      careerPathId: docRef.id,
      role: roadmap.role || "",
      completedSteps: 0,
      completedCourses: [],
      currentStep: 1,
      progress: 0,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection("user_learning_progress").add(progressData);
    
    revalidatePath("/career-path");
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving roadmap:", error);
    return { success: false, error: "Failed to save roadmap" };
  }
}

/**
 * Fetch all career paths for a specific user
 */
export async function getUserCareerPaths(userId: string) {
  try {
    const snapshot = await db
      .collection("career_paths")
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .get();
      
    const paths = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<CareerPath & { id: string }>;
    
    // Fetch corresponding progress for each path
    const pathsWithProgress = await Promise.all(paths.map(async (path) => {
        const progressSnapshot = await db
            .collection("user_learning_progress")
            .where("userId", "==", userId)
            .where("careerPathId", "==", path.id)
            .limit(1)
            .get();
            
        const progress = progressSnapshot.empty ? null : {
            id: progressSnapshot.docs[0].id,
            ...progressSnapshot.docs[0].data()
        } as UserLearningProgress & { id: string };
        
        return {
            ...path,
            progressData: progress
        };
    }));
    
    return pathsWithProgress;
  } catch (error) {
    console.error("Error fetching user paths:", error);
    return [];
  }
}

/**
 * Update learning progress for a specific career path step (toggle complete)
 */
export async function toggleStepCompletion(
  userId: string,
  progressId: string,
  stepNumber: number,
  isCompleted: boolean,
  totalSteps: number
) {
  try {
     const docRef = db.collection("user_learning_progress").doc(progressId);
     const doc = await docRef.get();
     if (!doc.exists) return { success: false, error: "Progress not found" };
     
     const progress = doc.data() as UserLearningProgress;
     
     // This is a simple counter for now, could be improved to track specific step IDs
     const newCompletedSteps = isCompleted ? progress.completedSteps + 1 : Math.max(0, progress.completedSteps - 1);
     const newPercentProgress = Math.round((newCompletedSteps / totalSteps) * 100);
     
     await docRef.update({
         completedSteps: newCompletedSteps,
         progress: newPercentProgress,
         updatedAt: new Date().toISOString(),
         currentStep: isCompleted ? Math.min(stepNumber + 1, totalSteps) : stepNumber
     });
     
     revalidatePath("/career-path");
     return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update progress" };
  }
}

/**
 * Delete a career path roadmap
 */
export async function deleteCareerPath(roadmapId: string) {
    try {
        await db.collection("career_paths").doc(roadmapId).delete();
        
        // Also cleanup progress
        const progressSnapshot = await db
            .collection("user_learning_progress")
            .where("careerPathId", "==", roadmapId)
            .get();
            
        const deleteOps = progressSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteOps);
        
        revalidatePath("/career-path");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete" };
    }
}
