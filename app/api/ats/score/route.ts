import { NextRequest, NextResponse } from "next/server";

// ATS Scoring algorithm
function calculateATSScore(
  resumeText: string,
  jobDescription?: string
): {
  score: number;
  feedback: string;
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
} {
  let score = 0;
  const feedback: string[] = [];
  const missingKeywords: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  const textLower = resumeText.toLowerCase();

  // Check for contact information (10 points)
  if (textLower.includes("email") || textLower.includes("@")) {
    score += 5;
    strengths.push("Email address present");
  } else {
    improvements.push("Add email address");
    missingKeywords.push("email");
  }

  if (
    textLower.includes("phone") ||
    /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(resumeText)
  ) {
    score += 5;
    strengths.push("Phone number present");
  } else {
    improvements.push("Add phone number");
    missingKeywords.push("phone");
  }

  // Check for work experience (15 points)
  const experienceKeywords = [
    "experience",
    "worked",
    "managed",
    "developed",
    "led",
    "responsible",
  ];
  if (experienceKeywords.some((kw) => textLower.includes(kw))) {
    score += 15;
    strengths.push("Work experience clearly described");
  } else {
    improvements.push("Highlight your work experience and responsibilities");
    missingKeywords.push("experience");
  }

  // Check for education (10 points)
  const educationKeywords = [
    "degree",
    "bachelor",
    "master",
    "education",
    "university",
  ];
  if (educationKeywords.some((kw) => textLower.includes(kw))) {
    score += 10;
    strengths.push("Education section present");
  } else {
    improvements.push("Include your educational background");
    missingKeywords.push("education");
  }

  // Check for skills section (15 points)
  if (
    textLower.includes("skills") ||
    textLower.includes("technical") ||
    textLower.includes("proficiency")
  ) {
    score += 15;
    strengths.push("Skills section identified");
  } else {
    improvements.push("Add a dedicated skills section");
    missingKeywords.push("skills");
  }

  // Check for achievements/metrics (10 points)
  const metricKeywords = [
    "%",
    "improved",
    "increased",
    "reduced",
    "achieved",
    "award",
  ];
  if (metricKeywords.some((kw) => textLower.includes(kw))) {
    score += 10;
    strengths.push("Quantifiable achievements present");
  } else {
    improvements.push(
      "Add measurable achievements with numbers and percentages"
    );
  }

  // Check for common technical keywords (15 points)
  const techKeywords = [
    "python",
    "javascript",
    "react",
    "aws",
    "sql",
    "git",
    "agile",
    "rest",
  ];
  let techCount = 0;
  techKeywords.forEach((kw) => {
    if (textLower.includes(kw)) techCount++;
  });
  if (techCount > 0) {
    score += Math.min(techCount * 3, 15);
    strengths.push(`${techCount} technical skills identified`);
  } else {
    improvements.push(
      "Include specific technical skills and technologies you know"
    );
  }

  // Check for certifications (10 points)
  if (textLower.includes("certification") || textLower.includes("certified")) {
    score += 10;
    strengths.push("Certifications included");
  }

  // Check for action verbs (10 points)
  const actionVerbs = [
    "led",
    "developed",
    "designed",
    "implemented",
    "created",
    "managed",
    "improved",
  ];
  if (actionVerbs.some((verb) => textLower.includes(verb))) {
    score += 10;
    strengths.push("Strong action verbs used");
  } else {
    improvements.push(
      "Use strong action verbs (led, developed, designed, etc.)"
    );
  }

  // Job description matching (if provided)
  if (jobDescription) {
    const jobLower = jobDescription.toLowerCase();
    const jobKeywords = jobLower.match(/\b[a-z]+\b/g) || [];
    const uniqueJobKeywords = [...new Set(jobKeywords)].filter(
      (w) => w.length > 3
    );

    const matchedCount = uniqueJobKeywords.filter((kw) =>
      textLower.includes(kw)
    ).length;

    const matchPercentage = (matchedCount / uniqueJobKeywords.length) * 100;
    const jobMatchScore = Math.round((matchPercentage / 100) * 10);
    score = Math.min(score + jobMatchScore, 100);

    const unmatchedKeywords = uniqueJobKeywords.filter(
      (kw) => !textLower.includes(kw)
    );
    missingKeywords.push(
      ...unmatchedKeywords
        .slice(0, 5)
        .map((kw) => `"${kw}" (from job description)`)
    );

    feedback.push(`Job match: ${Math.round(matchPercentage)}%`);
  }

  // Format score
  score = Math.min(score, 100);
  feedback.push(`Overall ATS Score: ${score}/100`);

  if (score >= 80) {
    feedback.push("Excellent! Your resume is ATS-friendly.");
  } else if (score >= 60) {
    feedback.push("Good! Consider making the suggested improvements.");
  } else {
    feedback.push("Your resume needs optimization for ATS systems.");
  }

  return {
    score,
    feedback: feedback.join(" "),
    missingKeywords,
    strengths,
    improvements,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    const result = calculateATSScore(resumeText, jobDescription);

    return NextResponse.json(result);
  } catch (error) {
    console.error("ATS Scoring error:", error);
    return NextResponse.json(
      { error: "Failed to score resume" },
      { status: 500 }
    );
  }
}
