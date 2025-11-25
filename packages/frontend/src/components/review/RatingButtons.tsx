"use client";

import { Button } from "@/components/ui/button";

interface RatingButtonsProps {
  onRate: (quality: number) => void;
  disabled?: boolean;
}

export function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mx-auto">
      <Button
        variant="outline"
        className="h-20 flex flex-col gap-2 hover:bg-red-50 hover:border-red-500"
        onClick={() => onRate(0)}
        disabled={disabled}
      >
        <span className="text-2xl">😰</span>
        <span className="font-semibold">Again</span>
        <span className="text-xs text-muted-foreground">&lt; 1 min</span>
      </Button>

      <Button
        variant="outline"
        className="h-20 flex flex-col gap-2 hover:bg-orange-50 hover:border-orange-500"
        onClick={() => onRate(3)}
        disabled={disabled}
      >
        <span className="text-2xl">🤔</span>
        <span className="font-semibold">Hard</span>
        <span className="text-xs text-muted-foreground">1 day</span>
      </Button>

      <Button
        variant="outline"
        className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-500"
        onClick={() => onRate(4)}
        disabled={disabled}
      >
        <span className="text-2xl">😊</span>
        <span className="font-semibold">Good</span>
        <span className="text-xs text-muted-foreground">2-3 days</span>
      </Button>

      <Button
        variant="outline"
        className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-500"
        onClick={() => onRate(5)}
        disabled={disabled}
      >
        <span className="text-2xl">🚀</span>
        <span className="font-semibold">Easy</span>
        <span className="text-xs text-muted-foreground">4+ days</span>
      </Button>
    </div>
  );
}

