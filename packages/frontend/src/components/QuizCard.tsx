"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, ListChecks } from "lucide-react";

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

interface QuizCardProps {
  quiz: Quiz;
}

export default function QuizCard({ quiz }: QuizCardProps): JSX.Element {
  const router = useRouter();

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "mixed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl font-bold">{quiz.title}</CardTitle>
          <Badge className={getDifficultyColor(quiz.difficulty)}>
            {quiz.difficulty}
          </Badge>
        </div>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quiz Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span>{quiz.questionCount} questions</span>
          </div>
          {quiz.timeLimit && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatTime(quiz.timeLimit)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{quiz.deck.name}</span>
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={() => router.push(`/quiz/${quiz._id}`)}
          className="w-full"
          size="lg"
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
}

