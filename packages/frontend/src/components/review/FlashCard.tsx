"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FlashCardProps {
  word: string;
  definition: string;
  pronunciation?: string;
  examples?: string[];
  onFlip?: (isFlipped: boolean) => void;
}

export function FlashCard({
  word,
  definition,
  pronunciation,
  examples,
  onFlip,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    onFlip?.(newFlipped);
  };

  const handlePlayAudio = () => {
    if (pronunciation) {
      const audio = new Audio(pronunciation);
      setIsPlaying(true);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  };

  return (
    <div
      className="perspective-1000 w-full max-w-2xl mx-auto cursor-pointer"
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-96"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <Card
          className="absolute w-full h-full flex items-center justify-center backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardHeader className="w-full">
            <div className="flex items-center justify-center gap-4">
              <CardTitle className="text-4xl font-bold text-center">
                {word}
              </CardTitle>
              {pronunciation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAudio();
                  }}
                  disabled={isPlaying}
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Click to reveal answer</p>
          </CardContent>
        </Card>

        {/* Back */}
        <Card
          className="absolute w-full h-full flex flex-col backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-2xl text-center">{word}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center space-y-4">
            <div>
              <p className="text-lg font-medium mb-2">Definition:</p>
              <p className="text-muted-foreground">{definition}</p>
            </div>
            {examples && examples.length > 0 && (
              <div>
                <p className="text-lg font-medium mb-2">Examples:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {examples.map((example, idx) => (
                    <li key={idx}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

