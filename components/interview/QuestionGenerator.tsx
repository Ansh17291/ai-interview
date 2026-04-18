// components/interview/QuestionGenerator.tsx
"use client";

import React, { useState } from "react";
import { Loader, Zap, Download, Share2 } from "lucide-react";
import { generateInterviewQuestions } from "@/lib/actions/interviewEnhancements.action";

export const QuestionGenerator = () => {
    const [jobDescription, setJobDescription] = useState("");
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
        "medium"
    );
    const [questions, setQuestions] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<keyof typeof questions>(
        "behavioral"
    );

    const handleGenerate = async () => {
        if (!jobDescription.trim()) {
            alert("Please paste a job description");
            return;
        }

        setLoading(true);
        try {
            const result = await generateInterviewQuestions(jobDescription, difficulty);
            setQuestions(result);
        } catch (error) {
            console.error("Error generating questions:", error);
            alert("Failed to generate questions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const QuestionCard = ({
        question,
        category,
    }: {
        question: any;
        category: string;
    }) => (
        <div className="bg-zinc-800/50 border border-white/10 hover:border-primary-100/30 rounded-lg p-4 space-y-2 transition-all">
            <div className="flex items-start justify-between">
                <p className="text-sm font-black text-white flex-1">{question.question}</p>
                <span className="text-xs px-2 py-1 bg-primary-100/20 text-primary-100 rounded font-bold whitespace-nowrap ml-2">
                    {question.timeLimit}min
                </span>
            </div>

            {question.follow_up && (
                <div className="bg-zinc-700/50 p-2 rounded">
                    <p className="text-xs text-zinc-300">
                        <span className="font-bold">Follow-up:</span> {question.follow_up}
                    </p>
                </div>
            )}

            {question.keywords && (
                <div className="flex flex-wrap gap-1">
                    {question.keywords.slice(0, 3).map((kw: string) => (
                        <span
                            key={kw}
                            className="text-[10px] px-2 py-1 bg-primary-200/10 text-primary-200 rounded"
                        >
                            {kw}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-100" />
                    <h2 className="text-2xl font-black text-white">Question Generator</h2>
                </div>
                <p className="text-sm text-zinc-400">
                    Paste a job description and we'll generate 50+ interview questions
                    tailored to the role.
                </p>
            </div>

            {!questions ? (
                <>
                    {/* Input Section */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-black text-zinc-300 block mb-2">
                                Job Description
                            </label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste job description here..."
                                className="w-full bg-zinc-800/50 border border-white/10 rounded-lg p-4 text-white placeholder-zinc-500 focus:border-primary-100/50 focus:outline-none resize-none h-40"
                            />
                        </div>

                        {/* Difficulty Selection */}
                        <div>
                            <label className="text-sm font-black text-zinc-300 block mb-2">
                                Difficulty Level
                            </label>
                            <div className="flex gap-2">
                                {(["easy", "medium", "hard"] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setDifficulty(level)}
                                        className={`flex-1 py-2 px-4 rounded-lg font-bold uppercase text-xs transition-all ${difficulty === level
                                                ? "bg-primary-100 text-black"
                                                : "bg-zinc-800/50 text-white border border-white/10 hover:border-white/30"
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-100 to-primary-200 text-black font-black py-3 rounded-lg hover:shadow-[0_0_30px_rgba(255,200,0,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Generating Questions...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Generate 50 Questions
                                </>
                            )}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Questions Display */}
                    <div className="space-y-4">
                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {Object.keys(questions).map((category) => (
                                <button
                                    key={category}
                                    onClick={() =>
                                        setActiveTab(category as keyof typeof questions)
                                    }
                                    className={`px-4 py-2 rounded-lg font-bold uppercase text-xs whitespace-nowrap transition-all ${activeTab === category
                                            ? "bg-primary-100 text-black"
                                            : "bg-zinc-800/50 text-white border border-white/10 hover:border-white/30"
                                        }`}
                                >
                                    {category} ({questions[category]?.length || 0})
                                </button>
                            ))}
                        </div>

                        {/* Questions Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                            {questions[activeTab]?.map((q: any, idx: number) => (
                                <QuestionCard
                                    key={idx}
                                    question={q}
                                    category={activeTab}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-white/10">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white hover:border-white/30 font-bold text-sm transition-all">
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-800/50 border border-white/10 rounded-lg text-white hover:border-white/30 font-bold text-sm transition-all">
                                <Share2 className="w-4 h-4" />
                                Share Set
                            </button>
                            <button
                                onClick={() => {
                                    setQuestions(null);
                                    setJobDescription("");
                                }}
                                className="flex-1 py-2 bg-primary-100 text-black rounded-lg font-bold text-sm hover:shadow-[0_0_20px_rgba(255,200,0,0.2)] transition-all"
                            >
                                Generate New
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 bg-zinc-800/40 border border-white/10 rounded-lg p-3">
                            <div className="text-center">
                                <p className="text-xl font-black text-primary-100">50</p>
                                <p className="text-[10px] text-zinc-400">Total Questions</p>
                            </div>
                            <div className="text-center border-l border-r border-white/10">
                                <p className="text-xl font-black text-primary-200">3h</p>
                                <p className="text-[10px] text-zinc-400">Est. Practice Time</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-green-400">100%</p>
                                <p className="text-[10px] text-zinc-400">Role Aligned</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
