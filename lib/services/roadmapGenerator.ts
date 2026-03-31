"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { CareerPath } from "@/types/index";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a custom career roadmap using Gemini AI
 */
export async function generateCustomRoadmap(
  targetGoal: string,
  targetLevel: "Junior" | "Mid" | "Senior" = "Junior"
): Promise<{ success: boolean; roadmap?: Partial<CareerPath>; error?: string }> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2-flash" });

    const prompt = `
      You are a professional career path architect. 
      Generate a detailed career roadmap for someone who wants to become: "${targetGoal}" at a "${targetLevel}" level.
      
      Requirements:
      1. Create a logical progression of 4-6 main steps/phases.
      2. For each step, provide:
         - A clear title
         - A brief description
         - A list of 3-5 specific skills to learn
         - An estimated duration (e.g., "4-6 weeks")
         - 2-3 specific milestones or projects to complete
         - Recommended resource types (courses, books, etc.) with possible providers (Coursera, Udemy, etc.)
      3. Include prerequisites and target companies for this role.
      4. Total duration for the roadmap.
      
      Return as a JSON object with this structure:
      {
        "role": "${targetGoal}",
        "title": "Comprehensive Roadmap to ${targetGoal}",
        "description": "Professional roadmap explanation...",
        "targetLevel": "${targetLevel}",
        "totalDuration": "e.g. 12 months",
        "prerequisites": ["skill1", "skill2"],
        "targetCompanies": ["Google", "Meta", "Amazon", etc.],
        "steps": [
          {
             "stepNumber": 1,
             "title": "Foundations of X",
             "description": "Beginner level description...",
             "duration": "4 weeks",
             "skills": [
                { "name": "Skill Name", "level": "Beginner", "estimatedHours": 20, 
                  "courses": [ { "id": "1", "title": "Great Course", "provider": "Coursera", "url": "https://..." } ] 
                }
             ],
             "milestones": ["Complete project X", "Pass assessment Y"]
          }
        ]
      }
      
      Maintain high quality, realistic expectations, and accurate information.
      Return ONLY valid JSON, no markdown.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        return { success: false, error: "Failed to generate roadmap structure" };
    }

    const roadmapData = JSON.parse(jsonMatch[0]);

    // Ensure IDs are present for steps
    roadmapData.steps = roadmapData.steps.map((step: any) => ({
        ...step,
        id: uuidv4()
    }));

    return {
        success: true,
        roadmap: roadmapData as Partial<CareerPath>
    };

  } catch (error) {
    console.error("Error generating roadmap:", error);
    return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate roadmap" 
    };
  }
}

/**
 * Summarize goals and provide simple visualization data
 */
export async function getRoadmapSummary(roadmap: CareerPath) {
    const totalSteps = roadmap.steps.length;
    const skillsToLearn = roadmap.steps.reduce((acc, step) => acc + (step.skills?.length || 0), 0);
    const duration = roadmap.totalDuration;
    
    return {
        totalSteps,
        skillsToLearn,
        duration,
        role: roadmap.role
    };
}
