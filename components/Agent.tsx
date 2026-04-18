"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback, saveTranscript } from "@/lib/actions/general.action";
import { LivePerformanceMetrics } from "@/components/interview/LivePerformanceMetrics";

import { toast } from "sonner";
import { Activity, ShieldCheck, Monitor, Video, Radio, Mic, PowerOff, Sparkles, Cpu, Zap, BrainCircuit, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasFinalized = useRef(false);

  const handleGenerateFeedback = useCallback(async (msgs: SavedMessage[]) => {
    if (hasFinalized.current) return;
    hasFinalized.current = true;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (!interviewId || !userId) {
      toast.error("Missing interview details.");
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
      toast.success("Intelligence report finalized.");
      router.push(`/interview/${interviewId}/feedback`);
    } else {
      toast.error(result.error || "Failed to finalize report.");
      hasFinalized.current = false;
      setCallStatus(CallStatus.INACTIVE);
    }
  }, [interviewId, userId, feedbackId, router, stream]);

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && callStatus === CallStatus.ACTIVE) {
        toast.error("Security Breach: Tab switching detected. Termination active.", { duration: 5000 });
        handleDisconnect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [callStatus]);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      hasFinalized.current = false;
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => toast.info("Secure mode requires fullscreen."));
      }
    };
    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      if (document.fullscreenElement) document.exitFullscreen().catch(e => console.error(e));
    };
    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final" && message.role && message.transcript) {
        setMessages((prev) => [...prev, { role: message.role, content: message.transcript }]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      
      // Safety cleanup: stop any active calls if component unmounts
      try {
        vapi.stop();
      } catch (e) {
        // Ignore errors during cleanup if call was already stopped
      }
    };
  }, []);

  useEffect(() => {
    if (callStatus === CallStatus.ACTIVE || callStatus === CallStatus.CONNECTING || callStatus === CallStatus.INACTIVE) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      }).catch(() => toast.error("Camera required for proctoring."));
    } else if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  }, [callStatus]);

  useEffect(() => {
    if ((callStatus === CallStatus.ACTIVE || callStatus === CallStatus.INACTIVE) && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      let animationId: number;
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgba(73, 222, 80, 0.4)";
        ctx.lineWidth = 1;
        const time = Date.now() * 0.002;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + Math.sin(time) * 0.2;
          const r = 35 + Math.cos(time + i) * 5;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        animationId = requestAnimationFrame(draw);
      };
      draw();
      return () => cancelAnimationFrame(animationId);
    }
  }, [callStatus]);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        if (hasFinalized.current) return;
        hasFinalized.current = true;
        saveTranscript({ userId, transcript: messages, type: "generate" }).then(() => router.push("/"));
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [callStatus, messages, type, handleGenerateFeedback, userId, router]);

  useEffect(() => {
    if (messages.length > 0) setLastMessage(messages[messages.length - 1].content);
  }, [messages]);

  const handleCall = async () => {
    if (callStatus !== CallStatus.INACTIVE) return;
    
    setCallStatus(CallStatus.CONNECTING);
    console.log("Starting VAPI interview session...", { type, userName, userId });

    try {
      if (type === "generate") {
        if (!process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID) {
          throw new Error("NEXT_PUBLIC_VAPI_WORKFLOW_ID is not configured");
        }
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID, { 
          variableValues: { username: userName, userid: userId } 
        });
      } else {
        await vapi.start(interviewer, {
          variableValues: {
            questions: questions?.map((q) => `- ${q}`).join("\n") || "",
            role: role || "", 
            level: level || "", 
            techstack: techStack?.join(", ") || "",
          },
        });
      }
      // Re-confirming active is handled by "call-start" event, but setting it here for UI responsiveness
      // Actually vapi.on("call-start") will trigger setCallStatus(CallStatus.ACTIVE)
    } catch (err: any) {
      console.error("VAPI Start Error Details:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      setCallStatus(CallStatus.INACTIVE);
      const errorMessage = err?.error?.message || err?.message || "Initialization sequence failed.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className={cn(
      "relative flex flex-col gap-8 w-full max-w-7xl mx-auto min-h-[600px] animate-in fade-in duration-1000",
      callStatus === CallStatus.ACTIVE && "fixed inset-0 z-[100] bg-zinc-950 p-6 lg:p-10 overflow-y-auto"
    )}>
      
      {(callStatus === CallStatus.ACTIVE || callStatus === CallStatus.INACTIVE) && (
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,rgba(73,222,80,0.03)_0%,transparent_100%)]">
           <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        </div>
      )}

      {/* Header System Bar */}
      <div className="w-full flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl px-6 py-4 shadow-2xl relative z-20">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-primary-100" />
               <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Biometric Guard</span>
            </div>
            <div className="flex items-center gap-2 hidden md:flex">
               <BrainCircuit className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Neural Vetting Mode</span>
            </div>
         </div>
         <div className="bg-primary-100/10 px-3 py-1 rounded-full border border-primary-100/20 flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", callStatus === CallStatus.ACTIVE ? "bg-primary-100" : "bg-blue-400")}></div>
            <span className={cn("text-[9px] font-black uppercase tracking-widest", callStatus === CallStatus.ACTIVE ? "text-primary-100" : "text-blue-400")}>
              {callStatus === CallStatus.ACTIVE ? "Vetting Live" : "Standby Readiness"}
            </span>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Main Interaction Hub (Center Console) */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="relative bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 p-8 lg:p-12 shadow-2xl overflow-hidden flex-1 flex flex-col justify-center border-b-4 border-b-primary-100/10">
            {(callStatus === CallStatus.ACTIVE || callStatus === CallStatus.INACTIVE) && (
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute w-full h-[1px] bg-primary-100/20 top-0 animate-scan"></div>
              </div>
            )}
            
            {/* Split View: AI and User Feed side-by-side */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 relative z-10 mb-10">
              
              {/* AI Interviewer Side */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  {isSpeaking && <div className="absolute inset-0 bg-primary-100/20 blur-3xl rounded-full animate-ping-slow"></div>}
                  <div className={cn("relative w-40 h-40 lg:w-56 lg:h-56 rounded-[2.5rem] bg-zinc-950 border-2 border-white/5 overflow-hidden transition-all duration-700 shadow-2xl", isSpeaking && "border-primary-100/50 scale-105")}>
                    <Image src="/ai-avatar.png" alt="AI" width={300} height={300} className="object-cover opacity-80" />
                  </div>
                  {isSpeaking && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 h-8 w-32">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-1 bg-primary-100 rounded-full animate-wave" style={{ animationDelay: `${i * 0.05}s`, height: '20%' }}></div>
                      ))}
                    </div>
                  )}
                </div>
                <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">AI PANEL</h4>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Interface Node 77</p>
              </div>

              {/* User Biometric Feed Side (Repositioned to avoid metrics) */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6 group">
                  <div className={cn(
                    "relative w-40 h-40 lg:w-56 lg:h-56 rounded-[2.5rem] bg-zinc-950 border-2 overflow-hidden transition-all duration-700 shadow-2xl",
                    callStatus === CallStatus.ACTIVE ? "border-emerald-500/30" : "border-blue-500/30"
                  )}>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror-view opacity-90" />
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" width={224} height={224} />
                    
                    {/* HUD Overlays within the frame */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[7px] font-black text-white/50 bg-black/60 px-2 py-1 rounded backdrop-blur-md uppercase">
                       <div className={cn("w-1 h-1 rounded-full animate-pulse", callStatus === CallStatus.ACTIVE ? "bg-red-500" : "bg-blue-500")}></div>
                       NODE_{userId.slice(0, 4)}
                    </div>
                    <div className="absolute bottom-3 right-3">
                       <div className={cn(
                         "flex items-center gap-1.5 text-[7px] font-black bg-black/60 px-2 py-1 rounded backdrop-blur-md uppercase tracking-tight",
                         callStatus === CallStatus.ACTIVE ? "text-emerald-400" : "text-blue-400"
                       )}>
                          <Target className="w-2.5 h-2.5" /> {callStatus === CallStatus.ACTIVE ? "GAZE: FOCUSED" : "CALIBRATING"}
                       </div>
                    </div>
                  </div>
                </div>
                <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">CANDIDATE</h4>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Secure Video Link</p>
              </div>

            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full mb-10"></div>

            {/* Transcript/Intelligence Box */}
            <div className="bg-zinc-950/80 border border-white/5 rounded-[2.5rem] p-8 min-h-[240px] max-h-[300px] overflow-y-auto relative custom-scrollbar group/sub">
               <div className="absolute top-4 left-8 flex items-center gap-2 text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                  <Radio className="w-3 h-3 text-primary-100 animate-pulse" /> Neural Data Stream
               </div>
               <div className="w-full h-full flex items-center justify-center">
                  {messages.length > 0 ? (
                    <p className="text-xl lg:text-3xl font-black text-white text-center leading-snug animate-in slide-in-from-bottom-2 duration-500 tracking-tight italic">
                      {lastMessage}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                       {callStatus === CallStatus.INACTIVE && (
                         <div className="grid grid-cols-3 gap-8 w-full max-w-sm">
                            {[ShieldCheck, Radio, Monitor].map((Icon, i) => (
                              <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                                   <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Signal {i+1}</span>
                              </div>
                            ))}
                         </div>
                       )}
                       <p className="text-zinc-600 uppercase text-[10px] font-black tracking-[0.4em] animate-pulse">
                          {callStatus === CallStatus.ACTIVE ? "Synthesizing audio nodes..." : "Ready for mission deployment."}
                       </p>
                    </div>
                  )}
               </div>
               <div className="absolute bottom-4 right-8 text-[8px] font-black text-zinc-800 uppercase tracking-[0.3em]">Integrity Level: High</div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="flex justify-center pt-2">
             {callStatus !== CallStatus.ACTIVE ? (
                <Button 
                  onClick={handleCall} 
                  disabled={callStatus === CallStatus.CONNECTING}
                  className="h-20 px-16 rounded-[2rem] bg-white text-zinc-950 hover:bg-primary-100 font-black text-2xl italic uppercase shadow-2xl transition-all scale-105 hover:scale-110 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
                >
                  {callStatus === CallStatus.CONNECTING ? (
                    <span className="flex items-center gap-4">
                      LINKING NETWORK... <Activity className="w-6 h-6 animate-spin" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-4">
                      INITIATE PROTOCOL <Zap className="w-6 h-6 fill-zinc-950 ml-4" />
                    </span>
                  )}
                </Button>
             ) : (
                <Button onClick={handleDisconnect} className="h-24 px-16 rounded-[2rem] border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white font-black text-3xl transition-all bg-zinc-900/50">
                  EXIT SESSION <PowerOff className="w-8 h-8 ml-4" />
                </Button>
             )}
          </div>
        </div>

        {/* Sidebar: Performance Matrix Only */}
        <div className={cn(
          "w-full lg:w-[440px] flex flex-col gap-6 animate-in slide-in-from-right-10 duration-1000",
          callStatus !== CallStatus.ACTIVE && "opacity-20 blur-sm pointer-events-none"
        )}>
          {/* Intelligence Panel */}
          <div className="bg-zinc-900/80 border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden h-full">
             <div className="flex items-center justify-between mb-8">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Intelligence Matrix</h4>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Streaming Metrics</span>
                </div>
             </div>
             
             <div className="custom-scrollbar h-full overflow-y-auto pr-2 pb-10">
                <LivePerformanceMetrics isLive={callStatus === CallStatus.ACTIVE} />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Agent;
