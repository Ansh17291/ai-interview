"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback, saveTranscript } from "@/lib/actions/general.action";

import { toast } from "sonner";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

// AgentProps type definition
interface AgentProps {
  userName: string;
  userId: string;
  interviewId: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
  role?: string;
  level?: string;
  techStack?: string[];
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  role,
  level,
  techStack,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  const hasFinalized = useRef(false);

  // Define handleGenerateFeedback at the component level using useCallback
  const handleGenerateFeedback = useCallback(async (msgs: SavedMessage[]) => {
    if (hasFinalized.current) return;
    hasFinalized.current = true;

    console.log("Finalizing interview. Messages collected:", msgs.length);

    if (!interviewId || !userId) {
      console.error("Missing interviewId or userId for feedback generation.");
      toast.error("Cannot generate feedback: Missing interview details.");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }

    const result = await createFeedback({
      interviewId: interviewId,
      userId: userId,
      transcript: msgs,
      feedbackId,
    });

    if (result.success && result.feedbackId) {
      toast.success("Feedback generated successfully!");
      router.push(`/interview/${interviewId}/feedback`);
    } else {
      toast.error(result.error || "Failed to generate feedback.");
      hasFinalized.current = false; // Allow retry if it failed
      setCallStatus(CallStatus.INACTIVE);
    }
  }, [interviewId, userId, feedbackId, router]);

  // Effect for VAPI event listeners
  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      hasFinalized.current = false;
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    type VapiMessage = {
      type?: string;
      transcriptType?: string;
      role?: "user" | "system" | "assistant";
      transcript?: string;
    };

    const onMessage = (message: VapiMessage) => {
      if (message.type === "transcript" && message.transcriptType === "final" && message.role && message.transcript) {
        const newMessage: SavedMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: unknown) => {
      // Improved error logging to capture details from empty/malformed errors
      let errorMessage = "Unknown error";
      let errorDetails = "";

      if (error instanceof Error) {
        errorMessage = error.message || "Unknown error";
        errorDetails = `\nStack: ${error.stack}`;
      } else if (typeof error === "object" && error !== null) {
        // Extract all properties from object
        const props = Object.keys(error).map(key => {
          const value = (error as Record<string, unknown>)[key];
          return `${key}: ${JSON.stringify(value)}`;
        });
        errorDetails = props.length > 0 ? `\nDetails: ${props.join(", ")}` : "\nError object is empty";
        errorMessage = "An error occurred during the call";
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      console.error("VAPI Error occurred:", { 
        error, 
        errorMessage, 
        errorDetails,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      toast.error(`An error occurred: ${errorMessage}`);
      setCallStatus(CallStatus.INACTIVE); // Reset status on error
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // Cleanup function to remove listeners
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleanup on unmount

  // Effect to handle call finishing logic based on callStatus
  useEffect(() => {
    const finalizeCall = async () => {
      if (callStatus === CallStatus.FINISHED) {
        if (type === "generate") {
          if (hasFinalized.current) return;
          hasFinalized.current = true;

          console.log("Finalizing generation call. Messages:", messages);

          try {
            await saveTranscript({
              userId,
              transcript: messages,
              type: "generate"
            });
            toast.success("Generation transcript saved.");
            router.push("/");
          } catch (error) {
            console.error("Error finalizing generation:", error);
            hasFinalized.current = false;
          }
        } else {
          // Generate feedback for interview type
          handleGenerateFeedback(messages);
        }
      }
    };

    finalizeCall();
  }, [callStatus, messages, type, router, handleGenerateFeedback, userId]);

  // Effect to update lastMessage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Using the content of the last message as lastMessage
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);


  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (!userId) {
      console.error("Missing critical prop: userId.");
      toast.error("Configuration error: Missing user details.");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }

    if (type === "interview" && !interviewId) {
      console.error("Missing critical prop for interview: interviewId.");
      toast.error("Configuration error: Missing interview details.");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }

    try {
      if (type === "generate") {
        const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
        if (!workflowId) {
          console.error("VAPI Workflow ID is not set.");
          toast.error("Configuration error: VAPI Workflow ID is missing for generation.");
          setCallStatus(CallStatus.INACTIVE);
          return;
        }

        console.log("Starting VAPI workflow:", { workflowId, userName, userId });
        await vapi.start(workflowId, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        console.log("Starting VAPI interview:", { role, level, questionsCount: questions?.length });
        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
            role: role || "",
            level: level || "",
            techstack: techStack?.join(", ") || "",
          },
        });
      }
      setCallStatus(CallStatus.ACTIVE); // Set to ACTIVE only after successful start
    } catch (error: unknown) {
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Failed to start VAPI call:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      } else if (typeof error === "object" && error !== null) {
        const props = Object.keys(error).map(key =>
          `${key}: ${JSON.stringify((error as Record<string, unknown>)[key])}`
        );
        errorMessage = props.length > 0 ? props.join(", ") : "Call initialization failed";
        console.error("Failed to start VAPI call:", error);
      } else {
        console.error("Failed to start VAPI call:", String(error));
      }
      toast.error(`Failed to start call: ${errorMessage}`);
      setCallStatus(CallStatus.INACTIVE); // Reset status on failure
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            {/* Keying by lastMessage can be problematic if messages are identical. 
                A unique ID per message would be better if available from VAPI. 
                Using lastMessage for now as per original code intent.
            */}
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
