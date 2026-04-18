// lib/actions/interview.action.ts - ADDITIONS

import { Anthropic } from "@anthropic-ai/sdk";
import { db } from "@/firebase/admin";

// ===== 1. GENERATE INTERVIEW QUESTIONS =====
export async function generateInterviewQuestions(
  jobDescription: string,
  difficulty: "easy" | "medium" | "hard" = "medium"
) {
  try {
    const client = new Anthropic();

    const prompt = `You are an expert interview coach. Analyze this job description and generate interview questions.

Job Description:
${jobDescription}

Generate exactly 50 interview questions in the following format (return as JSON):
{
  "behavioral": [
    { "question": "...", "follow_up": "...", "timeLimit": 2 }
  ],
  "technical": [
    { "question": "...", "follow_up": "...", "keywords": ["x", "y"], "timeLimit": 3 }
  ],
  "systemDesign": [
    { "question": "...", "acceptableSolution": "...", "timeLimit": 5 }
  ],
  "cultureFit": [
    { "question": "...", "follow_up": "...", "timeLimit": 1 }
  ]
}

Make questions:
- ${difficulty === "hard" ? "Challenging and nuanced" : difficulty === "easy" ? "Clear and straightforward" : "Balanced difficulty"}
- Specific to the role
- Realistic and commonly asked
- Include follow-ups for depth
- Add time recommendations

Return ONLY valid JSON.`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return JSON.parse(content.text);
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

// ===== 2. ANALYZE INTERVIEW TRANSCRIPT =====
export async function analyzeInterviewTranscript(
  transcript: string,
  jobDescription?: string
) {
  try {
    const client = new Anthropic();

    const prompt = `Analyze this interview transcript and provide detailed insights:

Transcript:
${transcript}

${jobDescription ? `Job Description:\n${jobDescription}` : ""}

Provide analysis in JSON format:
{
  "communicationMetrics": {
    "clarityScore": 0-100,
    "fluencyScore": 0-100,
    "professionalismScore": 0-100,
    "fillerWords": { "um": 5, "uh": 3, "like": 2 },
    "averagePauseLength": 2.5,
    "speakingPace": "normal|fast|slow"
  },
  "contentQuality": {
    "technicalAccuracy": 0-100,
    "completenessScore": 0-100,
    "relevanceToRole": 0-100,
    "examplesGiven": 3,
    "specificities": ["x", "y", "z"]
  },
  "sentimentProgression": [
    { "section": "opening", "sentiment": "confident", "stress": 0.3 },
    { "section": "middle", "sentiment": "engaged", "stress": 0.2 },
    { "section": "closing", "sentiment": "positive", "stress": 0.1 }
  ],
  "weakAreas": ["struggle with X", "unclear about Y"],
  "strengths": ["strong explanation of X", "good examples"],
  "improvements": ["Practice X", "Research Y"],
  "overallScore": 75,
  "recommendations": ["...", "...", "..."]
}

Return ONLY valid JSON.`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return JSON.parse(content.text);
    }
  } catch (error) {
    console.error("Error analyzing transcript:", error);
    throw error;
  }
}

// ===== 3. MATCH RESUME TO JOB DESCRIPTION =====
export async function matchResumeToJD(
  resumeText: string,
  jobDescription: string
) {
  try {
    const client = new Anthropic();

    const prompt = `Compare this resume against the job description and provide a match analysis.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide analysis in JSON format:
{
  "matchPercentage": 85,
  "skills": {
    "matched": ["Python", "React", "AWS"],
    "missing": ["Kubernetes", "GraphQL"],
    "bonus": ["Docker", "CI/CD"]
  },
  "experience": {
    "relevance": 80,
    "gap": "Missing 2 years backend experience",
    "strength": "Strong frontend background transferable"
  },
  "keywords": {
    "presentInJD": 45,
    "foundInResume": 38,
    "matchPercentage": 84
  },
  "improvements": [
    "Add Kubernetes project experience",
    "Highlight AWS architecture work",
    "Quantify impact with metrics"
  ],
  "rewriteSuggestions": {
    "current": "Led API development",
    "improved": "Led architecture of microservices API handling 10M+ requests/day, improving latency by 40%"
  },
  "atsScore": {
    "current": 72,
    "potential": 88,
    "formattingIssues": ["Multiple heading styles"]
  },
  "recommendation": "Strong technical fit with 2-3 improvements in presentation"
}

Return ONLY valid JSON.`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return JSON.parse(content.text);
    }
  } catch (error) {
    console.error("Error matching resume:", error);
    throw error;
  }
}

// ===== 4. CALCULATE INTERVIEW PERFORMANCE SCORE =====
export async function calculateInterviewScore(
  transcript: string,
  questions: string[],
  jobRole: string
) {
  try {
    const client = new Anthropic();

    const prompt = `Score this interview performance out of 100 for a ${jobRole} role.

Questions Asked:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Candidate's Answers:
${transcript}

Provide scoring in JSON:
{
  "technicalScore": { "score": 78, "reasoning": "..." },
  "communicationScore": { "score": 82, "reasoning": "..." },
  "problemSolvingScore": { "score": 75, "reasoning": "..." },
  "cultureFitScore": { "score": 80, "reasoning": "..." },
  "overallScore": 79,
  "topStrength": "Clear explanation of complex concepts",
  "mainWeakness": "Needs more concrete examples",
  "hiringRecommendation": "STRONG YES",
  "nextRound": true,
  "salaryRange": "120k-150k",
  "fitPercentage": 82
}

Return ONLY valid JSON.`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return JSON.parse(content.text);
    }
  } catch (error) {
    console.error("Error calculating score:", error);
    throw error;
  }
}

// ===== 5. SAVE TO LEADERBOARD =====
export async function saveToLeaderboard(
  userId: string,
  interviewScore: number,
  role: string,
  metrics: {
    averageConfidence: number;
    accuracyScore: number;
    completionTime: number;
  }
) {
  try {
    const leaderboardRef = db.collection("leaderboard");

    // Get total count for ranking
    const snapshot = await leaderboardRef
      .where("role", "==", role)
      .orderBy("interviewScore", "desc")
      .limit(1000)
      .get();

    const rank = snapshot.size + 1;
    const scores = snapshot.docs.map((d) => d.data().interviewScore);
    const percentile =
      ((scores.length - scores.filter((s) => s > interviewScore).length) /
        scores.length) *
      100;

    await leaderboardRef.add({
      timestamp: new Date(),
      userId,
      interviewScore,
      role,
      averageConfidence: metrics.averageConfidence,
      accuracyScore: metrics.accuracyScore,
      completionTime: metrics.completionTime,
      rank,
      percentile: Math.round(percentile),
    });

    return { rank, percentile };
  } catch (error) {
    console.error("Error saving to leaderboard:", error);
    throw error;
  }
}

// ===== 6. GET LEADERBOARD =====
export async function getLeaderboard(role: string, limit: number = 10) {
  try {
    const snapshot = await db
      .collection("leaderboard")
      .where("role", "==", role)
      .orderBy("interviewScore", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc, index) => ({
      id: doc.id,
      ...doc.data(),
      rank: index + 1,
    }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
}

// ===== 7. GET USER PERFORMANCE HISTORY =====
export async function getUserPerformanceHistory(userId: string) {
  try {
    const snapshot = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching performance history:", error);
    throw error;
  }
}
