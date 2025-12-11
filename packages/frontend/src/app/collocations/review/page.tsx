"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Volume2, RotateCcw, CheckCircle, XCircle, Clock } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { useAuthStore } from "@/store/authStore";
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
  difficulty: string;
}

export default function CollocationReviewPage(): JSX.Element {
  const router = useRouter();
  const { logout } = useAuthStore();
  
  const [collocations, setCollocations] = useState<Collocation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchCollocationsForReview();
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case " ":
          event.preventDefault();
          setIsFlipped(!isFlipped);
          break;
        case "1":
          if (isFlipped) handleRate(0);
          break;
        case "2":
          if (isFlipped) handleRate(3);
          break;
        case "3":
          if (isFlipped) handleRate(4);
          break;
        case "4":
          if (isFlipped) handleRate(5);
          break;
        case "Escape":
          router.push("/dashboard");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, router]);

  const fetchCollocationsForReview = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get("/collocations?limit=20");
      setCollocations(response.data.collocations || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch collocations:", err);
      setError("Failed to load collocations for review.");
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating: number): Promise<void> => {
    // This would integrate with SRS system
    console.log("Rating:", rating);
    
    // Move to next collocation
    if (currentIndex < collocations.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Review complete
      router.push("/dashboard");
    }
  };

  const playAudio = (): void => {
    const currentCollocation = collocations[currentIndex];
    if (currentCollocation?.pronunciation && !isPlaying) {
      setIsPlaying(true);
      const audio = new Audio(currentCollocation.pronunciation);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading collocations...</p>
        </div>
      </div>
    );
  }

  if (error || collocations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error || "No collocations available for review"}</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentCollocation = collocations[currentIndex];
  const progress = ((currentIndex + 1) / collocations.length) * 100;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit Review
        </Button>
        <Logo />
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {collocations.length}
          </div>
          <Button onClick={logout} variant="outline">
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 justify-center max-w-4xl mx-auto w-full">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Collocation Review Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Collocation Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 min-h-[400px] flex flex-col justify-center"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(currentCollocation.difficulty)}`}>
                {currentCollocation.difficulty}
              </div>
              {currentCollocation.pronunciation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio();
                  }}
                  disabled={isPlaying}
                >
                  <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
                </Button>
              )}
            </div>
            
            {!isFlipped ? (
              <div>
                <CardTitle className="text-4xl font-bold mb-4 text-primary">
                  {currentCollocation.phrase}
                </CardTitle>
                <p className="text-muted-foreground">
                  Click to see meaning or press Space
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <CardTitle className="text-2xl font-bold text-primary">
                  {currentCollocation.phrase}
                </CardTitle>
                <div className="text-xl font-semibold text-green-700 dark:text-green-400">
                  {currentCollocation.meaning}
                </div>
                
                {/* Components */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Components:
                  </h4>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {currentCollocation.components.map((component, index) => (
                      <div key={index} className="bg-muted p-3 rounded-lg text-center">
                        <div className="font-semibold">{component.word}</div>
                        <div className="text-sm text-muted-foreground">{component.meaning}</div>
                        {component.partOfSpeech && (
                          <div className="text-xs text-primary italic">({component.partOfSpeech})</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examples */}
                {currentCollocation.examples.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Examples:
                    </h4>
                    <div className="space-y-2">
                      {currentCollocation.examples.slice(0, 2).map((example, index) => (
                        <p key={index} className="text-sm italic text-muted-foreground bg-muted/50 p-2 rounded">
                          "{example}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Rating Buttons */}
        {isFlipped && (
          <div className="grid grid-cols-4 gap-4">
            <Button
              variant="destructive"
              onClick={() => handleRate(0)}
              className="flex flex-col gap-2 h-16"
            >
              <XCircle className="h-5 w-5" />
              <span className="text-xs">Again (1)</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRate(3)}
              className="flex flex-col gap-2 h-16 border-orange-300 hover:bg-orange-50"
            >
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-xs">Hard (2)</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRate(4)}
              className="flex flex-col gap-2 h-16 border-blue-300 hover:bg-blue-50"
            >
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="text-xs">Good (3)</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRate(5)}
              className="flex flex-col gap-2 h-16 border-green-300 hover:bg-green-50"
            >
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-xs">Easy (4)</span>
            </Button>
          </div>
        )}

        {/* Keyboard Hints */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Keyboard shortcuts: Space to flip, 1-4 to rate, ESC to exit</p>
        </div>
      </main>
    </div>
  );
}
