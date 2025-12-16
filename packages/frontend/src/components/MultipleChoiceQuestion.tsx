"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface MultipleChoiceQuestionProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  savedAnswer?: string;
}

export default function MultipleChoiceQuestion({
  question,
  options,
  correctAnswer,
  onAnswer,
  savedAnswer,
}: MultipleChoiceQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string>(savedAnswer || "");

  const handleSubmit = (): void => {
    if (selectedOption) {
      const isCorrect = selectedOption === correctAnswer;
      onAnswer(selectedOption, isCorrect);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <Button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="w-full"
          size="lg"
        >
          {savedAnswer ? "Update Answer" : "Submit Answer"}
        </Button>
      </CardContent>
    </Card>
  );
}

