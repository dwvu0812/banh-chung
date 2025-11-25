"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { FlashCard } from "@/components/review/FlashCard";
import { RatingButtons } from "@/components/review/RatingButtons";
import { ReviewProgress } from "@/components/review/ReviewProgress";
import { ArrowLeft, CheckCircle } from "lucide-react";

interface ReviewCard {
  _id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  examples?: string[];
  srsData: {
    nextReview: Date;
    interval: number;
    repetitions: number;
    easeFactor: number;
  };
}

export default function ReviewClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");
  const { accessToken, logout } = useAuthStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState(0);

  // Fetch review cards
  const { data: cards = [], isLoading } = useQuery<ReviewCard[]>({
    queryKey: ["reviewCards"],
    queryFn: async () => {
      const { data } = await api.get("/reviews");
      return data;
    },
    enabled: !!accessToken,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: ({ cardId, quality }: { cardId: string; quality: number }) =>
      api.post(`/reviews/${cardId}`, { quality }),
    onSuccess: () => {
      setReviewedCards((prev) => prev + 1);
      
      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        // Review session complete
        queryClient.invalidateQueries({ queryKey: ["reviewCards"] });
        queryClient.invalidateQueries({ queryKey: ["stats"] });
      }
    },
    onError: () => {
      toast.error("Failed to submit review");
    },
  });

  const handleRate = (quality: number) => {
    if (!isFlipped) {
      toast.error("Please flip the card first!");
      return;
    }

    const currentCard = cards[currentIndex];
    submitReviewMutation.mutate({ cardId: currentCard._id, quality });
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (submitReviewMutation.isPending) return;

    switch (e.key) {
      case " ":
        e.preventDefault();
        setIsFlipped((prev) => !prev);
        break;
      case "1":
        handleRate(0);
        break;
      case "2":
        handleRate(3);
        break;
      case "3":
        handleRate(4);
        break;
      case "4":
        handleRate(5);
        break;
      case "Escape":
        router.push(deckId ? `/decks/${deckId}` : "/dashboard");
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, currentIndex, cards, submitReviewMutation.isPending]);

  if (!accessToken) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-current border-t-transparent" />
      </div>
    );
  }

  if (cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
          <Logo />
          <div className="ml-auto">
            <Button onClick={logout} variant="outline">
              Đăng xuất
            </Button>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-3xl font-bold">Review Complete!</h1>
            <p className="text-muted-foreground">
              You've reviewed {reviewedCards} cards today. Great job!
            </p>
            <Link href={deckId ? `/decks/${deckId}` : "/dashboard"}>
              <Button>Back to {deckId ? "Deck" : "Dashboard"}</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <Link href={deckId ? `/decks/${deckId}` : "/dashboard"}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </Link>
        <Logo />
        <div className="ml-auto">
          <Button onClick={logout} variant="outline">
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 justify-center">
        {/* Progress */}
        <ReviewProgress current={currentIndex + 1} total={cards.length} />

        {/* Flash Card */}
        <FlashCard
          word={currentCard.word}
          definition={currentCard.definition}
          pronunciation={currentCard.pronunciation}
          examples={currentCard.examples}
          onFlip={setIsFlipped}
        />

        {/* Rating Buttons */}
        {isFlipped && (
          <RatingButtons
            onRate={handleRate}
            disabled={submitReviewMutation.isPending}
          />
        )}

        {/* Keyboard Hints */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Keyboard shortcuts: Space to flip, 1-4 to rate, ESC to exit</p>
        </div>
      </main>
    </div>
  );
}

