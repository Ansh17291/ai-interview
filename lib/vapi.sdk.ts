import Vapi from "@vapi-ai/web";

const apiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

if (!apiToken) {
  console.warn("VAPI_WEB_TOKEN is not configured. VAPI calls will fail.");
} else {
  console.log("VAPI SDK Initialized with token:", `${apiToken.slice(0, 6)}...${apiToken.slice(-4)}`);
}

const vapi = new Vapi(apiToken || "");

// Add global error handlers for VAPI
if (typeof window !== "undefined") {
  // Handle any unhandled VAPI errors
  vapi.on("error", (error: any) => {
    console.error("VAPI SDK global error:", error);
    
    // Better extraction for Daily.co errors
    if (error?.type === "daily-error") {
      console.error("Critical Daily.co Error:", error?.error?.error?.type || "unknown");
    }

    try {
      console.error("Full VAPI Error Details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch (e) {
      console.error("Could not stringify VAPI error:", error);
    }
  });

  // Track call state for debugging
  vapi.on("call-start", () => console.log("VAPI Call: Started"));
  vapi.on("call-end", () => console.log("VAPI Call: Ended"));
}

export { vapi };
