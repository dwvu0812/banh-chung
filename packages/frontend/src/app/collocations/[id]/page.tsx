"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Volume2, BookMarked } from "lucide-react";
import api from "@/lib/api";

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
  deck: {
    _id: string;
    name: string;
    description: string;
  };
}

export default function CollocationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [collocation, setCollocation] = useState<Collocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCollocation();
    }
  }, [id]);

  const fetchCollocation = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get(`/collocations/${id}`);
      setCollocation(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch collocation:", err);
      setError("Failed to load collocation details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (): Promise<void> => {
    if (!collocation || isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      // Import TTS utilities (dynamic import to avoid SSR issues)
      const { speakText, playAudioFromUrl, isTTSSupported } = await import('@/lib/tts');
      
      if (isTTSSupported()) {
        await speakText(collocation.phrase, { lang: 'en-US' });
      } else if (collocation.pronunciation) {
        await playAudioFromUrl(collocation.pronunciation);
      }
    } catch (error) {
      console.warn('TTS failed:', error);
    } finally {
      setIsPlaying(false);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading collocation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !collocation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Collocation not found"}</p>
            <Button onClick={() => router.push("/collocations")}>
              Back to Collocations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <Button
        variant="ghost"
        onClick={() => router.push("/collocations")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Collocations
      </Button>

      {/* Main Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold flex items-center gap-3 mb-2">
                {collocation.phrase}
                {collocation.pronunciation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={playAudio}
                    disabled={isPlaying}
                  >
                    <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
                  </Button>
                )}
              </CardTitle>
              <p className="text-xl text-muted-foreground">{collocation.meaning}</p>
            </div>
            <Badge className={getDifficultyColor(collocation.difficulty)}>
              {collocation.difficulty}
            </Badge>
          </div>

          {/* Tags */}
          {collocation.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {collocation.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Components */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              Word Components
            </h3>
            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
              {collocation.components.map((component, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{component.word}</span>
                    {component.partOfSpeech && (
                      <Badge variant="secondary" className="text-xs">
                        {component.partOfSpeech}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{component.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          {collocation.examples.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Example Sentences</h3>
              <ul className="space-y-3">
                {collocation.examples.map((example, index) => (
                  <li
                    key={index}
                    className="p-4 bg-muted/50 rounded-lg italic text-muted-foreground"
                  >
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deck Info */}
          {collocation.deck && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                From deck:{" "}
                <span className="font-medium text-foreground">
                  {collocation.deck.name}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

