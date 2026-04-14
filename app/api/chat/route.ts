import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { cookies } from "next/headers";
import { auth } from "@/firebase/admin";

export async function POST(req: Request) {
  // Authentication check
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await auth.verifySessionCookie(sessionCookie, false);
  } catch (err) {
    console.error("Session verification failed:", err);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const lastUserMessage =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    if (lastUserMessage.includes("image")) {
      const responseMessage = {
        type: "image",
        content: "https://picsum.photos/300/200",
      };
      return new Response(JSON.stringify(responseMessage), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (lastUserMessage.includes("video")) {
      const responseMessage = {
        type: "video",
        content: "https://www.w3schools.com/html/mov_bbb.mp4",
      };
      return new Response(JSON.stringify(responseMessage), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "AIzaSyCIq0ZRUgnXbBLUW4waK88OWItC-uMFGw8";
    if (!apiKey) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await generateText({
      model: google("gemini-2.0-flash"),
      system:
        "You are an AI Interview Coach. Help users with their doubts about interviews, tech stacks, and career advice. Be concise, encouraging, and professional.",
      messages: messages.map((msg: any) => ({
        role: msg.role || "user",
        content: msg.content || "",
      })),
    });

    return new Response(
      JSON.stringify({
        message:
          result.text ?? "I couldn't generate a response. Please try again.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({
        error: errorMessage || "Failed to process chat message",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
