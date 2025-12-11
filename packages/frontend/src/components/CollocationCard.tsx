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

  const getDifficultyIndicator = (difficulty: string): string => {
    switch (difficulty) {
      case "beginner":
        return "●";
      case "intermediate":
        return "●●";
      case "advanced":
        return "●●●";
      default:
        return "●";
    }
  };

  return (
    <div
      className="min-card p-6 hover:shadow-md transition-shadow cursor-pointer min-animate-fadeIn"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="min-text-title">{collocation.phrase}</h3>
            {collocation.pronunciation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={playAudio}
                disabled={isPlaying}
                className="h-6 w-6 p-0 min-focus opacity-60 hover:opacity-100"
              >
                <Volume2 className={`h-3 w-3 ${isPlaying ? "animate-pulse" : ""}`} />
              </Button>
            )}
          </div>
          <p className="min-text-caption mb-3">{collocation.meaning}</p>
        </div>
        <span className="min-text-caption text-primary font-mono">
          {getDifficultyIndicator(collocation.difficulty)}
        </span>
      </div>

      {/* Tags */}
      {collocation.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {collocation.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="min-text-caption bg-muted/50 px-2 py-1 rounded-sm">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Expandable Components */}
      <div className="min-border-top pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="min-button-ghost p-0 h-auto min-focus"
        >
          <span className="min-text-caption flex items-center gap-2">
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {isExpanded ? "Hide" : "Show"} Details
          </span>
        </Button>

        {isExpanded && (
          <div className="mt-4 min-spacing-sm">
            {/* Components */}
            <div className="mb-4">
              <p className="min-text-caption font-medium mb-2">Components:</p>
              <div className="space-y-1">
                {collocation.components.map((component, index) => (
                  <div key={index} className="min-text-caption">
                    <span className="font-medium">{component.word}</span>
                    {component.partOfSpeech && (
                      <span className="text-muted-foreground ml-2">
                        ({component.partOfSpeech})
                      </span>
                    )}
                    <span className="text-muted-foreground ml-2">- {component.meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Examples */}
            {collocation.examples.length > 0 && (
              <div>
                <p className="min-text-caption font-medium mb-2">Examples:</p>
                <div className="space-y-1">
                  {collocation.examples.slice(0, 2).map((example, index) => (
                    <p key={index} className="min-text-caption text-muted-foreground italic">
                      "{example}"
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

