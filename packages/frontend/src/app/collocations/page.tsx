"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CollocationList from "@/components/CollocationList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
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

        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">English Collocations</h1>
        </div>
        <p className="text-muted-foreground">
          Master English by learning phrases and word combinations
        </p>
      </div>

      {/* Collocation List */}
      <CollocationList
        collocations={collocations}
        onCollocationClick={handleCollocationClick}
      />
    </div>
  );
}

