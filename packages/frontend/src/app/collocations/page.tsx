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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading collocations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchCollocations}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">English Collocations</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Master English by learning natural word combinations
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Link href="/collocations/review">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Review
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/quiz">
                Take Quiz
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{collocations.length}</div>
            <div className="text-sm text-muted-foreground">Total Available</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">7</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {collocations.filter(c => c.difficulty === 'beginner').length}
            </div>
            <div className="text-sm text-muted-foreground">Beginner</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {collocations.filter(c => c.difficulty === 'advanced').length}
            </div>
            <div className="text-sm text-muted-foreground">Advanced</div>
          </div>
        </div>
      </div>

      {/* Collocation List */}
      <CollocationList
        collocations={collocations}
        onCollocationClick={handleCollocationClick}
      />
    </div>
  );
}

