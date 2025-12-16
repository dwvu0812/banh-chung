"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FillBlankQuestionProps {
  question: string;
  correctAnswer: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  savedAnswer?: string;
}

export default function FillBlankQuestion({
  question,
  correctAnswer,
  onAnswer,
  savedAnswer,
}: FillBlankQuestionProps) {
  const [userAnswer, setUserAnswer] = useState<string>(savedAnswer || "");

  const handleSubmit = (): void => {
    if (userAnswer.trim()) {
      const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
      onAnswer(userAnswer.trim(), isCorrect);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && userAnswer.trim()) {
      handleSubmit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="answer-input" className="text-sm font-medium">
            Your answer:
          </label>
          <Input
            id="answer-input"
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here..."
            className="text-lg"
            autoFocus
          />
          <p className="text-sm text-muted-foreground">
            Hint: Fill in the missing word from the collocation
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!userAnswer.trim()}
          className="w-full"
          size="lg"
        >
          {savedAnswer ? "Update Answer" : "Submit Answer"}
        </Button>
      </CardContent>
    </Card>
  );
}

