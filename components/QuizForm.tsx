"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormField from "@/components/FormField";
import { Loader2, Sparkles } from "lucide-react";
import { generateQuiz } from "@/lib/actions/general.action";
import { toast } from "sonner";

const quizFormSchema = z.object({
  role: z.string().min(2, "Role is required"),
  level: z.string().min(2, "Level is required"),
  techstack: z.string().min(2, "Tech stack is required"),
  company: z.string().optional(),
  amount: z.coerce.number().min(1, "Minimum 1 question").max(20, "Maximum 20 questions"),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

interface QuizFormProps {
  userId: string;
}

export default function QuizForm({ userId }: QuizFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      role: "",
      level: "",
      techstack: "",
      company: "",
      amount: 10,
    },
  });

  const onSubmit = async (values: QuizFormValues) => {
    setIsLoading(true);
    try {
      const techstackArray = values.techstack
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech !== "");

      const result = await generateQuiz({
        ...values,
        techstack: techstackArray,
        userId,
      });

      if (result.success && result.quizId) {
        toast.success("Quiz generated successfully!");
        router.push(`/quiz/${result.quizId}`);
      } else {
        toast.error(result.error || "Failed to generate quiz. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Generate AI Quiz</h1>
        <p className="text-zinc-400">
          Create a personalized quiz based on your role, level, and target company.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
          <FormField
            control={form.control}
            name="role"
            label="Job Role"
            placeholder="e.g. Frontend Developer"
          />
          <FormField
            control={form.control}
            name="level"
            label="Experience Level"
            placeholder="e.g. Junior, Mid, Senior"
          />
          <FormField
            control={form.control}
            name="techstack"
            label="Tech Stack (comma separated)"
            placeholder="e.g. React, Next.js, TypeScript"
          />
          <FormField
            control={form.control}
            name="company"
            label="Target Company (Optional)"
            placeholder="e.g. Google, Amazon, Meta"
          />
          <FormField
            control={form.control}
            name="amount"
            label="Number of Questions"
            placeholder="e.g. 10"
            type="number"
          />

          <Button 
            type="submit" 
            className="w-full btn-primary h-12 text-lg gap-2" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Generate Quiz
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
