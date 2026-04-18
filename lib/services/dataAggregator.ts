"use server";

import { db } from "@/firebase/admin";
import { Resume } from "@/types/index";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Fetch user's interview data
 */
async function fetchInterviewData(userId: string) {
  try {
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    const interviewData = [];

    for (const doc of interviews.docs) {
      const data = doc.data();
      // Fetch feedback for this interview
      const feedback = await db
        .collection("feedback")
        .where("interviewId", "==", doc.id)
        .limit(1)
        .get();

      interviewData.push({
        id: doc.id,
        ...data,
        feedback: !feedback.empty ? feedback.docs[0].data() : null,
      });
    }

    return interviewData;
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return [];
  }
}

/**
 * Fetch user's quiz results
 */
async function fetchQuizResults(userId: string) {
  try {
    const quizzes = await db
      .collection("quizResults")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    return quizzes.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return [];
  }
}

/**
 * Fetch user's GitHub profile data
 */
export async function fetchGitHubData(githubUsername: string) {
  try {
    // Fetch GitHub user data
    const userResponse = await fetch(
      `https://api.github.com/users/${githubUsername}`,
      {
        headers: {
          Authorization: process.env.GITHUB_API_TOKEN
            ? `token ${process.env.GITHUB_API_TOKEN}`
            : "",
        },
      }
    );

    if (!userResponse.ok) {
      return { success: false, error: "GitHub user not found" };
    }

    const userData = await userResponse.json();

    // Fetch repositories
    const reposResponse = await fetch(userData.repos_url, {
      headers: {
        Authorization: process.env.GITHUB_API_TOKEN
          ? `token ${process.env.GITHUB_API_TOKEN}`
          : "",
      },
    });

    const repositories = await reposResponse.json();

    // Extract languages and important data
    const languages = new Set<string>();
    const projects = [];

    for (const repo of repositories.slice(0, 10)) {
      // Fetch language data
      const langResponse = await fetch(repo.languages_url, {
        headers: {
          Authorization: process.env.GITHUB_API_TOKEN
            ? `token ${process.env.GITHUB_API_TOKEN}`
            : "",
        },
      });

      const langs = await langResponse.json();
      Object.keys(langs).forEach((lang) => languages.add(lang));

      if (!repo.fork) {
        projects.push({
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          stars: repo.stargazers_count,
          language: repo.language,
        });
      }
    }

    return {
      success: true,
      github: {
        username: userData.login,
        name: userData.name,
        bio: userData.bio,
        location: userData.location,
        email: userData.email,
        languages: Array.from(languages),
        projects,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        profileUrl: userData.html_url,
      },
    };
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return { success: false, error: "Failed to fetch GitHub data" };
  }
}

/**
 * Generate resume from aggregated user data
 */
export async function generateResumeFromUserData(
  userId: string,
  userInfo: {
    fullName: string;
    email: string;
    location?: string;
    githubUsername?: string;
    linkedInUrl?: string;
  }
): Promise<{
  success: boolean;
  resume?: Partial<Resume>;
  error?: string;
}> {
  try {
    // Collect data from all sources
    const interviews = await fetchInterviewData(userId);
    const quizzes = await fetchQuizResults(userId);
    let githubData = null;

    if (userInfo.githubUsername) {
      const ghResult = await fetchGitHubData(userInfo.githubUsername);
      if (ghResult.success) {
        githubData = ghResult.github;
      }
    }

    // Prepare data summary
    const dataSummary = {
      interviews: interviews.map((i) => ({
        role: (i as any).role,
        level: (i as any).level,
        techstack: (i as any).techstack,
        score: (i as any).score,
        date: (i as any).createdAt,
        strengths: (i as any).feedback?.strengths || [],
        areasForImprovement: (i as any).feedback?.areasForImprovement || [],
      })),
      quizzes: quizzes.map((q) => ({
        title: (q as any).title,
        score: (q as any).score,
        totalQuestions: (q as any).totalQuestions,
        role: (q as any).role,
      })),
      github: githubData,
    };

    // Use Gemini to generate resume
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return {
        success: false,
        error:
          "Gemini API key not configured. Please set GEMINI_API_KEY environment variable.",
      };
    }
    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Based on this user data, generate a professional resume JSON structure:

User Information:
- Name: ${userInfo.fullName}
- Email: ${userInfo.email}
- Location: ${userInfo.location || "Not provided"}

Data from their platform activity:
${JSON.stringify(dataSummary, null, 2)}

Create a resume JSON with this structure (exactly as shown):
{
  "personalInfo": {
    "fullName": "${userInfo.fullName}",
    "email": "${userInfo.email}",
    "phone": "",
    "location": "${userInfo.location || ""}",
    "linkedIn": "${userInfo.linkedInUrl || ""}",
    "portfolio": "${githubData?.profileUrl || ""}"
  },
  "summary": "string - Professional summary created from interview and quiz performance",
  "experience": [
    {
      "id": "exp_X",
      "companyName": "Self-Employed / Freelance",
      "position": "Full Stack Developer / Software Engineer",
      "startDate": "2024-01",
      "endDate": "Present",
      "currentlyWorking": true,
      "description": "Description based on GitHub projects and technical experience"
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "institution": "Self-Directed Learning",
      "degree": "Professional Developer",
      "field": "Software Development",
      "graduationDate": "2024-12",
      "gpa": ""
    }
  ],
  "skills": ["array of technical skills from GitHub, quizzes, and interviews"],
  "certifications": [],
  "insights": {
    "score": number,
    "strengths": ["compiled from interview feedback"],
    "improvements": ["compiled from areas for improvement in interviews"],
    "marketRelevance": "short paragraph"
  }
}

Guidelines:
- Skills should include all languages and technologies found on GitHub
- Include technologies from interview subjects
- Create a compelling professional summary
- Extract real projects from GitHub
- Be honest and realistic based on actual data
- Focus on demonstrated skills through projects and assessments

Return ONLY valid JSON, no markdown.
    `;

    const response = await model.generateContent(prompt);
    const responseText = response.response.text();

    // Parse JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: "Failed to generate resume structure",
      };
    }

    const generatedResume = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      resume: generatedResume as Partial<Resume>,
    };
  } catch (error) {
    console.error("Error generating resume:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate resume",
    };
  }
}

/**
 * Check if user has GitHub profile linked
 */
export async function getUserGitHubProfile(userId: string) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return null;

    const userData = userDoc.data() as any;
    return userData.githubUsername || null;
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return null;
  }
}

/**
 * Get summary of user technical experience
 */
export async function getUserTechSummary(userId: string) {
  try {
    const interviews = await fetchInterviewData(userId);
    const quizzes = await fetchQuizResults(userId);

    // Extract all technologies
    const allTechs = new Set<string>();

    interviews.forEach((i) => {
      const techstack = (i as any).techstack || [];
      techstack.forEach((t: string) => allTechs.add(t));
    });

    quizzes.forEach((q) => {
      const role = (q as any).role || "";
      if (role) allTechs.add(role);
    });

    // Calculate proficiency levels
    const techLevels = Array.from(allTechs).map((tech) => {
      const interviewCount = interviews.filter((i) =>
        (i as any).techstack?.includes(tech)
      ).length;
      const quizCount = quizzes.filter((q) => (q as any).role === tech).length;

      let level = "Beginner";
      if (interviewCount >= 2 || quizCount >= 3) level = "Intermediate";
      if (interviewCount >= 3 || quizCount >= 5) level = "Advanced";

      return { tech, level, practiced: interviewCount + quizCount };
    });

    return {
      allTechs: Array.from(allTechs),
      techLevels: techLevels.sort((a, b) => b.practiced - a.practiced),
      interviewCount: interviews.length,
      quizCount: quizzes.length,
      topAreas: techLevels.slice(0, 5).map((t) => t.tech),
    };
  } catch (error) {
    console.error("Error getting tech summary:", error);
    return null;
  }
}
