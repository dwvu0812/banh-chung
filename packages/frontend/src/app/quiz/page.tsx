"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuizCard from "@/components/QuizCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import api from "@/lib/api";

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questionCount: number;
  difficulty: string;
  timeLimit?: number;
  deck: {
    name: string;
  };
}

export default function QuizListPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get("/quizzes");
      setQuizzes(response.data.quizzes || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      setError("Failed to load quizzes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchQuizzes}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Quizzes</h1>
        </div>
        <p className="text-muted-foreground">
          Test your knowledge with interactive quizzes
        </p>
      </div>

      {/* Quiz Grid */}
      {quizzes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No quizzes available yet</p>
        </div>
      )}

      {/* Results Link */}
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={() => router.push("/quiz/results")}
        >
          View My Results
        </Button>
      </div>
    </div>
  );
}

