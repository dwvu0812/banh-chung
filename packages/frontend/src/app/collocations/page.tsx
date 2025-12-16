"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CollocationList from "@/components/CollocationList";
import { Button } from "@/components/ui/button";
import { PaginationWrapper, PaginationInfo } from "@/components/ui/pagination-wrapper";
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

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface CollocationsResponse {
  collocations: Collocation[];
  pagination: PaginationData;
}

export default function CollocationsPage(): JSX.Element {
  const router = useRouter();
  const [collocations, setCollocations] = useState<Collocation[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollocations(1);
  }, []);

  const fetchCollocations = async (page: number = pagination.page): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get<CollocationsResponse>("/collocations", {
        params: {
          page,
          limit: pagination.limit
        }
      });
      
      setCollocations(response.data.collocations || []);
      setPagination(response.data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
      setError(null);
    } catch (err) {
      console.error("Failed to fetch collocations:", err);
      setError("Failed to load collocations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number): void => {
    fetchCollocations(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="min-grid-stats mb-8">
          <div className="text-center">
            <div className="text-2xl font-light text-primary mb-1">{pagination.total}</div>
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
            <div className="min-text-caption">This Page: Beginner</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light text-foreground mb-1">
              {collocations.filter(c => c.difficulty === 'advanced').length}
            </div>
            <div className="min-text-caption">This Page: Advanced</div>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="flex justify-center mb-6">
          <PaginationInfo 
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            currentPage={pagination.page}
          />
        </div>

        {/* Collocation List */}
        <CollocationList
          collocations={collocations}
          onCollocationClick={handleCollocationClick}
          enableClientFiltering={false}
        />

        {/* Pagination Controls */}
        <div className="mt-12 mb-8">
          <PaginationWrapper
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}

