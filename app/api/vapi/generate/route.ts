import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        questions: z.array(z.string()),
      }),
      prompt: `Prepare ${amount} questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
    `,
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(",").map((s: string) => s.trim()),
      questions: object.questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);

    return Response.json({ success: true, id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error("Error generating interview:", error);
    return Response.json({ success: false, error: "Failed to generate interview questions" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
