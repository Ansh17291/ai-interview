"use client";

import { useState } from "react";
import { MessageSquare, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Transcript } from "./Transcript";
import { Button } from "@/components/ui/button";

interface Message {
  role: string;
  content: string;
}

interface TranscriptDialogProps {
  transcript: Message[];
  role: string;
  level: string;
}

export function TranscriptDialog({ transcript, role, level }: TranscriptDialogProps) {
  const [open, setOpen] = useState(false);

  if (!transcript || transcript.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-400/50 hover:bg-primary-100/10 text-light-400 hover:text-primary-100 transition-all border border-light-400/10 hover:border-primary-100/20 group"
        >
          <MessageSquare className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-wider">View Transcript</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-dark-200 border-light-400/10 p-0 overflow-hidden rounded-[2rem]">
        <div className="p-6 border-b border-light-400/5 bg-dark-300/50">
          <DialogTitle className="text-xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-primary-100/10 rounded-xl">
              <MessageSquare className="w-6 h-6 text-primary-100" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-light-400 uppercase tracking-[0.2em] font-bold">Interview Transcript</span>
              <span className="capitalize">{level} {role}</span>
            </div>
          </DialogTitle>
        </div>
        <div className="p-4 bg-dark-400/20">
          <Transcript
            transcript={transcript}
            height="550px"
            className="border-none bg-transparent"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
