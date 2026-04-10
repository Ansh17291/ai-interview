import Vapi from "@vapi-ai/web";

const apiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

if (!apiToken) {
  console.warn("VAPI_WEB_TOKEN is not configured. VAPI calls will fail.");
}

const vapi = new Vapi(apiToken || "");

// Add global error handlers for VAPI
if (typeof window !== "undefined") {
  // Handle any unhandled VAPI errors
  vapi.on("error", (error: unknown) => {
    console.error("VAPI SDK global error:", error);
    console.error("Full VAPI Error Details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
  });
}

export { vapi };
