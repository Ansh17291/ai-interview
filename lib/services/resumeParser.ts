"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resume } from "@/types/index";

/**
 * Parse resume from text using Gemini AI
 * Extracts structured data from unstructured resume text
 */
export async function parseResumeText(resumeText: string): Promise<{
  success: boolean;
  data?: Partial<Resume>;
  error?: string;
}> {
  try {
    const genAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
    );
    const model = genAI.getGenerativeModel({ model: "gemini-2-flash" });

    const prompt = `
You are an expert resume parser. Extract structured information from the following resume text and return a JSON object with this exact structure:

{
  "personalInfo": {
    "fullName": "string",
    "email": "string (or empty string if not found)",
    "phone": "string (or empty string)",
    "location": "string (or empty string)",
    "linkedIn": "string (or empty string)",
    "portfolio": "string (or empty string)"
  },
  "summary": "string (professional summary, or empty string)",
  "experience": [
    {
      "id": "exp_1",
      "companyName": "string",
      "position": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or 'Present'",
      "currentlyWorking": boolean,
      "description": "string (responsibilities and achievements)"
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "YYYY-MM",
      "gpa": "string (or empty string)"
    }
  ],
  "skills": ["string array of technical skills"],
  "certifications": ["string array of certifications"]
}

Important:
- If a field is not found, use empty string "" for strings and empty array [] for arrays
- Extract ALL skills mentioned in the resume (programming languages, frameworks, tools)
- Keep descriptions as provided, don't shorten them
- Be thorough and preserve all meaningful information

Resume Text:
${resumeText}

Return ONLY valid JSON, no markdown code blocks.
    `;

    const response = await model.generateContent(prompt);
    const responseText = response.response.text();

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        success: false,
        error: "Failed to parse resume structure",
      };
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      data: parsedData as Partial<Resume>,
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse resume",
    };
  }
}

/**
 * Extract text from PDF file
 * Handles PDF parsing and text extraction
 */
export async function extractPdfText(
  buffer: Uint8Array
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    // Using pdfjs-dist for PDF parsing
    const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return {
      success: true,
      text: fullText,
    };
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to extract PDF text",
    };
  }
}

/**
 * Extract text from DOCX file
 */
export async function extractDocxText(
  buffer: Buffer
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });

    return {
      success: true,
      text: result.value,
    };
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to extract DOCX text",
    };
  }
}

/**
 * Main function to parse resume from file buffer
 */
export async function parseResumeFile(
  buffer: Buffer,
  fileName: string
): Promise<{
  success: boolean;
  data?: Partial<Resume>;
  error?: string;
}> {
  try {
    // Determine file type
    const ext = fileName.split(".").pop()?.toLowerCase();

    let extractedText: string | undefined;

    if (ext === "pdf") {
      // Convert Buffer to Uint8Array for pdf.js compatibility
      const uint8Array = new Uint8Array(buffer);
      const result = await extractPdfText(uint8Array);
      if (!result.success) return result;
      extractedText = result.text;
    } else if (ext === "docx") {
      const result = await extractDocxText(buffer);
      if (!result.success) return result;
      extractedText = result.text;
    } else if (ext === "txt") {
      extractedText = buffer.toString("utf-8");
    } else {
      return {
        success: false,
        error: "Unsupported file format. Use PDF, DOCX, or TXT.",
      };
    }

    if (!extractedText) {
      return {
        success: false,
        error: "Could not extract text from file",
      };
    }

    // Parse extracted text with Gemini
    const parseResult = await parseResumeText(extractedText);
    return parseResult;
  } catch (error) {
    console.error("Error parsing resume file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse resume",
    };
  }
}
