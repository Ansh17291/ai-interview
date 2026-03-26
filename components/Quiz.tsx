"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Trophy, ArrowRight, RotateCcw, LogOut, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { saveQuizResult } from "@/lib/actions/general.action";
import { toast } from "sonner";

interface QuizProps {
  quiz: Quiz;
  userId: string;
}

export default function Quiz({ quiz, userId }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;

    let newScore = score;
    if (selectedOption === currentQuestion.correctAnswer) {
      newScore = score + 1;
      setScore(newScore);
    }
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = selectedOption;
    setUserAnswers(newUserAnswers);
    
    setIsAnswered(true);
    setTotalAttempted((prev) => prev + 1);
  };

  const handleFinishQuiz = async (finalScore: number, finalAnswers: (number | null)[]) => {
    setIsSaving(true);
    try {
      const res = await saveQuizResult({
        quizId: quiz.id,
        userId,
        score: finalScore,
        totalQuestions: quiz.questions.length,
        userAnswers: finalAnswers,
      });
      
      if (res.success) {
        toast.success("Quiz results saved!");
      } else {
        toast.error("Failed to save results, but you can still see them here.");
      }
    } catch (err) {
      console.error("Error saving quiz:", err);
    } finally {
      setIsSaving(false);
      setShowResults(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      handleFinishQuiz(score, userAnswers);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTotalAttempted(0);
    setShowResults(false);
    setUserAnswers([]);
    setShowReview(false);
  };

  const handleEndQuiz = () => {
    if (confirm("Are you sure you want to end the quiz? Your current progress will be saved and shown.")) {
      // For userAnswers, ensure it's filled up to total questions with nulls for unattempted
      const finalAnswers = [...userAnswers];
      for (let i = 0; i < quiz.questions.length; i++) {
        if (finalAnswers[i] === undefined) finalAnswers[i] = null;
      }
      handleFinishQuiz(score, finalAnswers);
    }
  };

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100) || 0;
    
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Card className="p-8 text-center bg-zinc-900 border-zinc-800 text-white mb-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-3xl font-bold mb-2">Quiz Results</h2>
          <p className="text-zinc-400 mb-6">
            You scored {score} out of {quiz.questions.length} questions.
          </p>
          
          <div className="text-6xl font-bold mb-8 text-blue-500">{percentage}%</div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={handleReset} variant="outline" className="gap-2 border-zinc-700 hover:bg-zinc-800 text-white">
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
            <Button 
              onClick={() => setShowReview(!showReview)} 
              variant="outline" 
              className="gap-2 border-zinc-700 hover:bg-zinc-800 text-white"
            >
              {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showReview ? "Hide Review" : "Review Answers"}
            </Button>
            <Link href="/quiz">
              <Button className="w-full sm:w-auto gap-2">
                Back to Quizzes <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>

        {showReview && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">Detailed Review</h3>
            {quiz.questions.map((q, idx) => {
              const userAnswer = userAnswers[idx];
              const isCorrect = userAnswer === q.correctAnswer;
              const isSkipped = userAnswer === undefined || userAnswer === null;

              return (
                <Card key={idx} className={`p-6 bg-zinc-900 border-zinc-800 text-white ${isSkipped ? 'opacity-70' : ''}`}>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h4 className="text-lg font-semibold">
                      {idx + 1}. {q.question}
                    </h4>
                    {isSkipped ? (
                      <span className="text-zinc-500 text-sm font-medium px-2 py-1 bg-zinc-800 rounded">Skipped</span>
                    ) : isCorrect ? (
                      <span className="text-green-500 text-sm font-medium px-2 py-1 bg-green-500/10 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Correct
                      </span>
                    ) : (
                      <span className="text-red-500 text-sm font-medium px-2 py-1 bg-red-500/10 rounded flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    {q.options.map((option, optIdx) => {
                      let optionClass = "p-3 rounded-lg border border-zinc-800 bg-zinc-800/30 text-zinc-400";
                      
                      if (optIdx === q.correctAnswer) {
                        optionClass = "p-3 rounded-lg border border-green-500/50 bg-green-500/10 text-green-400 font-medium";
                      } else if (userAnswer === optIdx && !isCorrect) {
                        optionClass = "p-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-400 font-medium";
                      }

                      return (
                        <div key={optIdx} className={optionClass}>
                          <div className="flex justify-between items-center">
                            <span>{option}</span>
                            {optIdx === q.correctAnswer && <CheckCircle2 className="w-4 h-4" />}
                            {userAnswer === optIdx && !isCorrect && <XCircle className="w-4 h-4" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
            <p className="text-zinc-400">{quiz.role} • {quiz.level}</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
            <span className="text-zinc-400 font-medium whitespace-nowrap">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleEndQuiz}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
            >
              <LogOut className="w-4 h-4" /> End Quiz
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-zinc-800" />
      </div>

      <Card className="p-6 bg-zinc-900 border-zinc-800 text-white">
        <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>
        
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => {
            let className = "w-full justify-start text-left h-auto py-4 px-6 border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 hover:text-white transition-all";
            
            if (selectedOption === index) {
              className = "w-full justify-start text-left h-auto py-4 px-6 bg-blue-600/20 border-blue-500 text-white transition-all";
            }
            
            if (isAnswered) {
              if (index === currentQuestion.correctAnswer) {
                className = "w-full justify-start text-left h-auto py-4 px-6 bg-green-600/20 border-green-500 text-white transition-all";
              } else if (selectedOption === index && selectedOption !== currentQuestion.correctAnswer) {
                className = "w-full justify-start text-left h-auto py-4 px-6 bg-red-600/20 border-red-500 text-white transition-all";
              } else {
                className = "w-full justify-start text-left h-auto py-4 px-6 bg-zinc-900 border-zinc-800 text-zinc-500 opacity-50";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={isAnswered}
                className={`rounded-xl border-2 flex items-center justify-between group ${className}`}
              >
                <span>{option}</span>
                {isAnswered && index === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {isAnswered && selectedOption === index && selectedOption !== currentQuestion.correctAnswer && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          {!isAnswered ? (
            <Button 
              onClick={handleConfirmAnswer} 
              disabled={selectedOption === null}
              className="px-8"
            >
              Confirm Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} disabled={isSaving} className="px-8 gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : currentQuestionIndex === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
              {!isSaving && <ArrowRight className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
