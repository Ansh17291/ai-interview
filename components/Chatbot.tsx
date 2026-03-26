"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(""); // State for input value
  const [messages, setMessages] = useState<Message[]>([]); // State for messages
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return; // Prevent empty messages

    const newUserMessage: Message = { role: "user", content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue(""); // Clear input after sending
    setIsLoading(true); // Set loading state

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, newUserMessage] }),
      });

      if (!response.ok) {
        // Try to get more details from the response body
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}. ${errorText}`);
      }

      const responseData = await response.json();

      let botMessage: Message;
      if (responseData.type && responseData.content) {
        botMessage = { role: "assistant", content: JSON.stringify(responseData) };
      } else {
        const textContent = responseData.message || (typeof responseData === 'string' ? responseData : JSON.stringify(responseData));
        botMessage = { role: "assistant", content: textContent };
      }
      setMessages((prevMessages) => [...prevMessages, botMessage]);

    } catch (error: unknown) { // Changed 'any' to 'unknown' for better type safety
      console.error("Error sending message:", error);
      let errorMessage = "Sorry, I encountered an error. Please try again.";

      // Safely access error properties
      if (typeof error === 'object' && error !== null) {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
        // Check for specific properties like statusCode if the error object structure is known
        if ('statusCode' in error && typeof error.statusCode === 'number') {
          if (errorMessage.includes("quota") || error.statusCode === 429) {
            errorMessage = "API quota exceeded. Please try again later.";
          }
        } else if (errorMessage.includes("quota")) {
          // Fallback for quota errors if statusCode is not available but message indicates it
          errorMessage = "API quota exceeded. Please try again later.";
        }
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: errorMessage }
      ]);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="mb-4 w-[350px] sm:w-[400px] h-[500px] flex flex-col bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Interview Coach
                </h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-[10px] text-zinc-400">Online</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800"
          >
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <Bot className="w-12 h-12 text-zinc-700 mx-auto" />
                <p className="text-zinc-400 text-sm">
                  Hello! I&apos;m your AI Coach. How can I help you today?
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  {["Interview tips?", "Resume help?", "Common questions?"].map(
                    (tip) => (
                      <button
                        key={tip}
                        onClick={() => setInputValue(tip)} // Set input value on click
                        className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full border border-zinc-800 transition-colors"
                      >
                        {tip}
                      </button>
                    )
                  )}
                </div>
              </div >
            )
            }
            {
              messages.map((m, index) => { // Added index for key if m.id is not available
                let messageContent;
                try {
                  // Check if message content is a JSON string for rich media
                  const parsed = JSON.parse(m.content);
                  if (parsed.type && parsed.content) {
                    if (parsed.type === "image") {
                      messageContent = (
                        <Image
                          src={parsed.content}
                          alt="chatbot image"
                          width={300}
                          height={200}
                          className="rounded-lg max-w-full h-auto" // Ensure image fits
                        />
                      );
                    } else if (parsed.type === "video") {
                      messageContent = (
                        <video
                          src={parsed.content}
                          controls
                          className="rounded-lg max-w-full h-auto" // Ensure video fits
                        />
                      );
                    } else {
                      // Fallback for other JSON types, or if it's just a stringified object
                      messageContent = m.content;
                    }
                  } else {
                    // Not a recognized rich media JSON
                    messageContent = m.content;
                  }
                } catch {
                  // Not JSON, treat as plain text
                  messageContent = m.content;
                }

                return (
                  <div
                    key={m.id || index} // Use index as fallback for key
                    className={cn(
                      "flex items-start gap-2 max-w-[85%]",
                      m.role === "user" ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                        m.role === "user" ? "bg-zinc-700" : "bg-blue-600"
                      )}
                    >
                      {m.role === "user" ? (
                        <User className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "p-3 rounded-2xl text-sm",
                        m.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none"
                      )}
                    >
                      {messageContent}
                    </div>
                  </div>
                );
              })
            }
            {
              isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-white animate-pulse" />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )
            }
          </div >

          <form onSubmit={handleFormSubmit} className="p-4 border-t border-zinc-800 bg-zinc-900">
            <div className="flex gap-2">
              <Input
                value={inputValue} // Use state for input value
                onChange={(e) => setInputValue(e.target.value)} // Update state on change
                placeholder="Ask your doubt..."
                className="bg-zinc-950 border-zinc-800 focus-visible:ring-blue-600"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !inputValue || inputValue.trim() === ""}
                className="bg-blue-600 hover:bg-blue-700 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card >
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          isOpen
            ? "bg-zinc-800 hover:bg-zinc-700 rotate-90"
            : "bg-blue-600 hover:bg-blue-700"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>
    </div >
  );
}
