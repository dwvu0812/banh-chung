"use client";

import { Progress } from "@/components/ui/progress";

interface ReviewProgressProps {
  current: number;
  total: number;
}

export function ReviewProgress({ current, total }: ReviewProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Progress</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

