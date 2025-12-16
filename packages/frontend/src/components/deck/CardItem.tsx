"use client";

import { useState } from "react";
import { Trash2, Edit, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CardData {
  _id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  examples?: string[];
}

interface CardItemProps {
  card: CardData;
  onEdit: (card: CardData) => void;
  onDelete: (cardId: string) => void;
}

export function CardItem({ card, onEdit, onDelete }: CardItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      // Import TTS utilities (dynamic import to avoid SSR issues)
      const { speakText, playAudioFromUrl, isTTSSupported } = await import('@/lib/tts');
      
      if (isTTSSupported()) {
        await speakText(card.word, { lang: 'en-US' });
      } else if (card.pronunciation) {
        await playAudioFromUrl(card.pronunciation);
      }
    } catch (error) {
      console.warn('TTS failed:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {card.word}
              {card.pronunciation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
            <CardDescription>{card.definition}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(card)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(card._id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {card.examples && card.examples.length > 0 && (
        <CardContent>
          <p className="text-sm font-medium mb-2">Examples:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            {card.examples.map((example, idx) => (
              <li key={idx}>{example}</li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
