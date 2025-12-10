"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CollocationComponent {
  word: string;
  meaning: string;
  partOfSpeech?: string;
}

interface Collocation {
  _id: string;
  phrase: string;
  meaning: string;
  components: CollocationComponent[];
  examples: string[];
  pronunciation?: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface CollocationCardProps {
  collocation: Collocation;
  onClick?: () => void;
}

export default function CollocationCard({ collocation, onClick }: CollocationCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (collocation.pronunciation && !isPlaying) {
      setIsPlaying(true);
      const audio = new Audio(collocation.pronunciation);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {collocation.phrase}
              {collocation.pronunciation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playAudio}
                  disabled={isPlaying}
                  className="h-8 w-8 p-0"
                >
                  <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
                </Button>
              )}
            </CardTitle>
            <p className="text-muted-foreground mt-1">{collocation.meaning}</p>
          </div>
          <Badge className={getDifficultyColor(collocation.difficulty)}>
            {collocation.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Tags */}
          {collocation.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {collocation.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Expandable Components */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center gap-2"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {isExpanded ? "Hide" : "Show"} Components
              </span>
            </Button>

            {isExpanded && (
              <div className="mt-3 space-y-2 pl-4 border-l-2 border-primary/20">
                {collocation.components.map((component, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-semibold">{component.word}</span>
                    {component.partOfSpeech && (
                      <span className="text-muted-foreground italic ml-2">
                        ({component.partOfSpeech})
                      </span>
                    )}
                    <p className="text-muted-foreground">{component.meaning}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Examples */}
          {collocation.examples.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Examples:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {collocation.examples.slice(0, 2).map((example, index) => (
                  <li key={index} className="italic">
                    • {example}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

