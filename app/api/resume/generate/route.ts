import { NextRequest, NextResponse } from "next/server";
import { generateResumeFromUserData } from "@/lib/services/dataAggregator";
import { db } from "@/firebase/admin";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/resume/generate
 * Generate resume from user's interview, quiz, and GitHub data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, email, location, githubUsername, linkedInUrl } = body;

    if (!userId || !fullName || !email) {
      return NextResponse.json(
        { error: "userId, fullName, and email are required" },
        { status: 400 }
      );
    }

    // Generate resume from user data
    const result = await generateResumeFromUserData(userId, {
      fullName,
      email,
      location,
      githubUsername,
      linkedInUrl,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Save to Firestore
    const resumeId = uuidv4();
    const now = new Date().toISOString();

    const resumeData = {
      id: resumeId,
      userId,
      title: `${fullName}'s Generated Resume`,
      ...result.resume,
      type: "generated",
      source: "auto_generate",
      generatedAt: now,
      createdAt: now,
      updatedAt: now,
      isParsed: true,
      sources: {
        interviews: true,
        quizzes: true,
        github: !!githubUsername,
        linkedin: !!linkedInUrl,
      },
    };

    await db.collection("resumes").doc(resumeId).set(resumeData);

    // Update user's GitHub profile if provided
    if (githubUsername) {
      await db.collection("users").doc(userId).update({
        githubUsername,
        lastDataSync: now,
      });
    }

    return NextResponse.json({
      success: true,
      resumeId,
      resume: resumeData,
      message:
        "Resume generated from your interviews and quizzes. You can now optimize it for specific roles!",
    });
  } catch (error) {
    console.error("Error in resume generate API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate resume",
      },
      { status: 500 }
    );
  }
}
