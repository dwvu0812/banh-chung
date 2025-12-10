"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuizStore } from "@/store/quizStore";
import MultipleChoiceQuestion from "@/components/MultipleChoiceQuestion";
import FillBlankQuestion from "@/components/FillBlankQuestion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Clock, CheckCircle } from "lucide-react";
import api from "@/lib/api";

export default function QuizTakePage(): JSX.Element {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const {
    currentQuiz,
    currentQuestionIndex,
    answers,
    startTime,
    timeElapsed,
    isSubmitted,
    setQuiz,
    startQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
    updateTimeElapsed,
  } = useQuizStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuizQuestions();
    }
    return () => {
      resetQuiz();
    };
  }, [id]);

  useEffect(() => {
    if (startTime && !isSubmitted) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        updateTimeElapsed(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, isSubmitted]);

  const fetchQuizQuestions = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get(`/quizzes/${id}/questions`);
      setQuiz(response.data);
      startQuiz();
      setError(null);
    } catch (err) {
      console.error("Failed to fetch quiz questions:", err);
      setError("Failed to load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (userAnswer: string, isCorrect: boolean): void => {
    if (!currentQuiz) return;

    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    answerQuestion({
      questionIndex: currentQuestionIndex,
      questionType: currentQuestion.questionType,
      collocationId: currentQuestion.collocationId,
      userAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (!currentQuiz || answers.length !== currentQuiz.questionCount) {
      alert("Please answer all questions before submitting");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/quizzes/${id}/submit`, {
        answers,
        timeSpent: timeElapsed,
      });
      submitQuiz();
      router.push("/quiz/results");
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentQuiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Quiz not found"}</p>
            <Button onClick={() => router.push("/quiz")}>Back to Quizzes</Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const savedAnswer = answers.find((a) => a.questionIndex === currentQuestionIndex);
  const progress = ((currentQuestionIndex + 1) / currentQuiz.questionCount) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/quiz")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Exit Quiz
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentQuiz.title}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Question {currentQuestionIndex + 1} of {currentQuiz.questionCount}
                </span>
                <span>{answers.length} answered</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question */}
      <div className="mb-6">
        {currentQuestion.questionType === "definition_choice" && currentQuestion.options && (
          <MultipleChoiceQuestion
            question={currentQuestion.question}
            options={currentQuestion.options}
            correctAnswer={currentQuestion.correctAnswer as string}
            onAnswer={handleAnswer}
            savedAnswer={savedAnswer?.userAnswer as string}
          />
        )}

        {currentQuestion.questionType === "fill_blank" && (
          <FillBlankQuestion
            question={currentQuestion.question}
            correctAnswer={currentQuestion.correctAnswer as string}
            onAnswer={handleAnswer}
            savedAnswer={savedAnswer?.userAnswer as string}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentQuestionIndex < currentQuiz.questionCount - 1 ? (
          <Button onClick={nextQuestion}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || answers.length !== currentQuiz.questionCount}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}

