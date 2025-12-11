"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CollocationList from "@/components/CollocationList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
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
}

export default function CollocationsPage(): JSX.Element {
  const router = useRouter();
  const [collocations, setCollocations] = useState<Collocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollocations();
  }, []);

  const fetchCollocations = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get("/collocations");
      setCollocations(response.data.collocations || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch collocations:", err);
      setError("Failed to load collocations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCollocationClick = (collocation: Collocation): void => {
    router.push(`/collocations/${collocation._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="min-text-caption">Loading collocations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <p className="min-text-body text-destructive mb-6">{error}</p>
          <Button onClick={fetchCollocations} className="min-focus">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <div className="min-border-bottom">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="min-button-ghost min-focus mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </div>

      {/* Clean Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="min-text-display">English Collocations</h1>
          </div>
          <p className="min-text-body text-muted-foreground max-w-2xl mx-auto">
            Master English by learning natural word combinations
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 max-w-md mx-auto">
          <Link href="/collocations/review" className="flex-1">
            <Button size="lg" className="w-full min-focus">
              <BookOpen className="mr-2 h-4 w-4" />
              Start Review
            </Button>
          </Link>
          <Link href="/quiz" className="flex-1">
            <Button variant="outline" size="lg" className="w-full min-focus">
              Take Quiz
            </Button>
          </Link>
        </div>

        {/* Minimal Statistics */}
        <div className="min-grid-stats mb-12">
          <div className="text-center">
            <div className="text-2xl font-light text-primary mb-1">{collocations.length}</div>
            <div className="min-text-caption">Total Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light text-foreground mb-1">7</div>
            <div className="min-text-caption">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light text-foreground mb-1">
              {collocations.filter(c => c.difficulty === 'beginner').length}
            </div>
            <div className="min-text-caption">Beginner</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light text-foreground mb-1">
              {collocations.filter(c => c.difficulty === 'advanced').length}
            </div>
            <div className="min-text-caption">Advanced</div>
          </div>
        </div>

        {/* Collocation List */}
        <CollocationList
          collocations={collocations}
          onCollocationClick={handleCollocationClick}
        />
      </div>
    </div>
  );
}

