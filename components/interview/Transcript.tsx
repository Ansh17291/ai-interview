import { MessageSquare } from "lucide-react";

interface Message {
  role: string;
  content: string;
}

interface TranscriptProps {
  transcript: Message[];
  height?: string;
  className?: string;
}

export const Transcript = ({ transcript, height = "500px", className = "" }: TranscriptProps) => {
  if (!transcript || transcript.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-center text-light-400 p-10 bg-dark-200/40 rounded-2xl border border-light-400/10 ${className}`} style={{ height }}>
        <MessageSquare className="w-12 h-12 mb-4 opacity-10" />
        <p className="text-sm font-medium">No transcript available for this session.</p>
      </div>
    );
  }

  return (
    <div className={`bg-dark-200/40 border border-light-400/10 rounded-2xl overflow-hidden flex flex-col ${className}`} style={{ height }}>
      <div className="p-4 border-b border-light-400/10 bg-dark-300/30 flex items-center justify-between">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary-100" /> Interaction Transcript
        </h3>
        <span className="text-[10px] bg-dark-100 px-2 py-1 rounded text-light-400 uppercase font-bold tracking-tighter ring-1 ring-light-400/5">
          {transcript.length} Messages
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-dark-300/10">
        {transcript.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} animate-in slide-in-from-bottom-2 duration-300`} style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className={`text-[10px] uppercase font-black tracking-[0.15em] ${msg.role === "user" ? "text-primary-100" : "text-zinc-500"}`}>
                {msg.role === "user" ? "Candidate Response" : "AI Interviewer"}
              </span>
            </div>
            <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-lg transition-all border ${
              msg.role === "user"
                ? "bg-gradient-to-br from-primary-100 to-primary-200 text-dark-100 font-bold rounded-tr-sm border-primary-200/20"
                : "bg-zinc-900/80 border-white/5 text-zinc-100 rounded-tl-sm backdrop-blur-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
