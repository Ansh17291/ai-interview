import { NextRequest, NextResponse } from "next/server";
import { parseResumeFile } from "@/lib/services/resumeParser";
import { db } from "@/firebase/admin";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/resume/parse
 * Upload and parse a resume file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and userId are required" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOCX, and TXT files are allowed" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse resume
    const parseResult = await parseResumeFile(buffer, file.name);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    // Save to Firestore
    const resumeId = uuidv4();
    const now = new Date().toISOString();

    const resumeData = {
      id: resumeId,
      userId,
      title: parseResult.data?.personalInfo?.fullName || "Untitled Resume",
      ...parseResult.data,
      type: "uploaded",
      source: "file_upload",
      createdAt: now,
      updatedAt: now,
      isParsed: true,
      fileName: file.name,
    };

    await db.collection("resumes").doc(resumeId).set(resumeData);

    return NextResponse.json({
      success: true,
      resumeId,
      resume: resumeData,
      message: "Resume parsed and saved successfully",
    });
  } catch (error) {
    console.error("Error in resume parse API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to parse resume",
      },
      { status: 500 }
    );
  }
}
