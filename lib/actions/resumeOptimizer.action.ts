"use server";

import { db } from "@/firebase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resume } from "@/types/index";
import { revalidatePath } from "next/cache";

/**
 * Optimize resume for a specific job role/description using Gemini
 */
export async function optimizeResumeForRole(
  resumeId: string,
  targetRole: string,
  jobDescription: string
) {
  try {
    // 1. Fetch current resume
    const doc = await db.collection("resumes").doc(resumeId).get();
    if (!doc.exists) return { success: false, error: "Resume not found" };
    
    const resume = doc.data() as Resume;
    const userId = resume.userId;

    // 2. Prepare prompt for Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2-flash" });

    const prompt = `
      You are an expert ATS (Applicant Tracking System) optimizer and professional career coach.
      
      I want you to optimize the following resume for the target role: "${targetRole}"
      
      Target Job Description:
      "${jobDescription}"
      
      Current Resume Data:
      ${JSON.stringify(resume, null, 2)}
      
      Please perform the following tasks:
      1. Analyze how well the current resume matches the job description.
      2. Rewrite the professional summary to highlight relevant experience for this role.
      3. For each experience entry, optimize the bullet points to use keywords from the job description and focus on relevant achievements.
      4. Identify which skills from the resume match the job description and which ones are missing but recommended for this role.
      5. Calculate an ATS match score (0-100) before and after optimization.
      
      Return the result as a JSON object with this structure:
      {
        "optimizedResume": {
          "title": "Optimized for ${targetRole}",
          "summary": "string",
          "experience": [
             { "id": "original_id", "description": "optimized description" }
          ],
          "skills": ["updated skill list"],
          "personalInfo": { ...original... }
        },
        "atsAnalysis": {
          "scoreBefore": number,
          "scoreAfter": number,
          "matchedKeywords": ["string"],
          "missingKeywords": ["string"],
          "improvements": ["string"],
          "feedback": "string"
        }
      }
      
      Maintain the original IDs for experience and education. 
      Only return valid JSON, no markdown.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: "Failed to generate optimized content" };
    }

    const { optimizedResume, atsAnalysis } = JSON.parse(jsonMatch[0]);

    // 3. Create new optimized version in Firestore
    const newResumeData = {
      ...resume,
      title: `${resume.title} (Optimized for ${targetRole})`,
      summary: optimizedResume.summary,
      experience: resume.experience.map(exp => {
        const optimizedIdx = optimizedResume.experience.findIndex((o: any) => o.id === exp.id);
        return optimizedIdx !== -1 ? { ...exp, description: optimizedResume.experience[optimizedIdx].description } : exp;
      }),
      skills: optimizedResume.skills,
      jobDescriptionScore: {
        score: atsAnalysis.scoreAfter,
        matchedKeywords: atsAnalysis.matchedKeywords,
        missingKeywords: atsAnalysis.missingKeywords
      },
      updatedAt: new Date().toISOString(),
      isOptimized: true,
      originalResumeId: resumeId,
      targetRole: targetRole
    };

    const newDoc = await db.collection("resumes").add(newResumeData);
    
    revalidatePath("/resume");
    return { 
      success: true, 
      id: newDoc.id, 
      analysis: atsAnalysis 
    };

  } catch (error) {
    console.error("Error optimizing resume:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to optimize resume" 
    };
  }
}

/**
 * Quick analysis of resume against JD without creating a new version
 */
export async function analyzeResumeAgainstJD(resumeId: string, jobDescription: string) {
  try {
     const doc = await db.collection("resumes").doc(resumeId).get();
     if (!doc.exists) return { success: false, error: "Resume not found" };
     
     const resume = doc.data() as Resume;
     
     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
     const model = genAI.getGenerativeModel({ model: "gemini-2-flash" });

     const prompt = `
       Analyze this resume against the job description.
       
       Resume: ${JSON.stringify(resume)}
       Job Description: ${jobDescription}
       
       Provide a match score (0-100), matched keywords, missing keywords, and 3 specific tips for improvement.
       Return as JSON: { "score": number, "matched": [], "missing": [], "tips": [] }
       Only return valid JSON.
     `;

     const result = await model.generateContent(prompt);
     const text = result.response.text();
     const jsonMatch = text.match(/\{[\s\S]*\}/);
     
     if (!jsonMatch) return { success: false, error: "Analysis failed" };
     
     return { success: true, analysis: JSON.parse(jsonMatch[0]) };
  } catch (error) {
    return { success: false, error: "Failed to analyze" };
  }
}
