"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Clock, CheckCircle, XCircle } from "lucide-react";
import api from "@/lib/api";

interface QuizResult {
  _id: string;
  quiz: {
    title: string;
    description: string;
    difficulty: string;
    deck: {
      name: string;
    };
  };
  score: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
}

export default function QuizResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get("/quizzes/results");
      setResults(response.data.results || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch quiz results:", err);
      setError("Failed to load results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number): string => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score >= 60)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading results...</p>
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
            <Button onClick={fetchResults}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push("/quiz")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Quiz Results</h1>
        </div>
        <p className="text-muted-foreground">View your quiz performance history</p>
      </div>

      {/* Results List */}
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result) => (
            <Card
              key={result._id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/quiz/results/${result._id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{result.quiz.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {result.quiz.deck.name} • {formatDate(result.completedAt)}
                    </p>
                  </div>
                  <Badge className={getScoreBadge(result.score)}>{result.score}%</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      {Math.round((result.score / 100) * result.totalQuestions)} /{" "}
                      {result.totalQuestions} correct
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(result.timeSpent)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No quiz results yet</p>
          <Button onClick={() => router.push("/quiz")}>Take Your First Quiz</Button>
        </div>
      )}
    </div>
  );
}

