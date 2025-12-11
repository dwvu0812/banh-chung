"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  BookCopy,
  BookOpen,
  BrainCircuit,
  Layers,
  PlusCircle,
  Target,
  Trophy,
} from "lucide-react";

// Định nghĩa kiểu dữ liệu cho Deck
interface Deck {
  _id: string;
  name: string;
  description: string;
}

interface DeckWithStats extends Deck {
  cardCount: number;
  cardsDue: number;
}

interface DashboardStats {
  cardsDueToday: number;
  totalCards: number;
  newCardsToday: number;
  totalDecks: number;
  collocation: {
    total: number;
    dueToday: number;
  };
  quiz: {
    totalTaken: number;
    averageScore: number;
  };
}

// Hàm fetch dữ liệu
const fetchDecks = async (): Promise<Deck[]> => {
  const { data } = await api.get("/decks");
  return data;
};

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/stats/dashboard");
  return data;
};

export default function DashboardClient() {
  const queryClient = useQueryClient();
  const { accessToken, logout } = useAuthStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDesc, setNewDeckDesc] = useState("");

  const { data: decks, isLoading } = useQuery<Deck[]>({
    queryKey: ["decks"],
    queryFn: fetchDecks,
    enabled: !!accessToken,
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    enabled: !!accessToken,
  });

  // Fetch individual deck stats for card counts
  const deckStatsQueries = useQuery({
    queryKey: ["allDeckStats", decks?.map((d) => d._id)],
    queryFn: async () => {
      if (!decks) return [];
      const statsPromises = decks.map((deck) =>
        api.get(`/stats/deck/${deck._id}`).then((res) => res.data)
      );
      return Promise.all(statsPromises);
    },
    enabled: !!accessToken && !!decks && decks.length > 0,
  });

  const decksWithStats: DeckWithStats[] = decks?.map((deck, index) => ({
    ...deck,
    cardCount: deckStatsQueries.data?.[index]?.totalCards || 0,
    cardsDue: deckStatsQueries.data?.[index]?.cardsDue || 0,
  })) || [];

  const createDeckMutation = useMutation({
    mutationFn: (newDeck: { name: string; description: string }) =>
      api.post("/decks", newDeck),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setDialogOpen(false);
      setNewDeckName("");
      setNewDeckDesc("");
    },
  });

  const handleCreateDeck = () => {
    if (newDeckName.trim()) {
      createDeckMutation.mutate({
        name: newDeckName,
        description: newDeckDesc,
      });
    }
  };

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

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* === Minimal Header === */}
      <header className="min-border-bottom bg-background">
        <div className="flex h-14 items-center gap-4 px-6">
          <Logo />
          <div className="ml-auto">
            <Button onClick={logout} variant="ghost" size="sm" className="min-button-ghost min-focus">
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-6 py-8 min-spacing-lg">
        {/* === Primary Collocation Learning Section === */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="min-text-display flex items-center justify-center gap-3 mb-2">
              <BookOpen className="h-8 w-8 text-primary" />
              English Collocations Learning
            </h1>
            <p className="min-text-caption">Master English through natural word combinations</p>
          </div>

          {/* Main CTA Card - Minimal Design */}
          <div className="min-card p-8 text-center mb-8">
            <h2 className="min-text-title mb-4">Start Learning Collocations</h2>
            <div className="min-grid-stats mb-6">
              <div className="text-center">
                <div className="text-2xl font-light text-primary mb-1">
                  {stats?.collocation?.total || 0}
                </div>
                <div className="min-text-caption">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-foreground mb-1">
                  {stats?.collocation?.dueToday || 0}
                </div>
                <div className="min-text-caption">Due Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-foreground mb-1">7</div>
                <div className="min-text-caption">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-foreground mb-1">
                  {stats?.quiz?.totalTaken || 0}
                </div>
                <div className="min-text-caption">Quizzes Taken</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Link href="/collocations" className="flex-1">
                <Button size="lg" className="w-full min-focus">
                  Browse Collocations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/collocations/review" className="flex-1">
                <Button variant="outline" size="lg" className="w-full min-focus">
                  Start Review
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* === Secondary Actions - Minimal Layout === */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Quiz Section */}
            <Link href="/quiz">
              <div className="min-card p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                <Trophy className="h-6 w-6 text-primary mx-auto mb-3" />
                <h3 className="min-text-title mb-2">Quiz Performance</h3>
                <div className="text-lg font-light text-foreground mb-1">
                  {stats?.quiz?.averageScore || 0}%
                </div>
                <p className="min-text-caption">Average Score</p>
              </div>
            </Link>

            {/* Review Section */}
            <Link href="/review">
              <div className="min-card p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                <BookCopy className="h-6 w-6 text-primary mx-auto mb-3" />
                <h3 className="min-text-title mb-2">Flashcard Review</h3>
                <div className="text-lg font-light text-foreground mb-1">
                  {stats?.cardsDueToday || 0}
                </div>
                <p className="min-text-caption">Cards Due Today</p>
              </div>
            </Link>

            {/* Deck Management */}
            <div className="min-card p-6 text-center">
              <Layers className="h-6 w-6 text-primary mx-auto mb-3" />
              <h3 className="min-text-title mb-2">Your Decks</h3>
              <div className="text-lg font-light text-foreground mb-1">
                {stats?.totalDecks || 0}
              </div>
              <p className="min-text-caption">Total Decks</p>
            </div>
          </div>
        </div>

        {/* === Deck Management - Simplified === */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="min-text-title">Manage Decks</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="min-focus">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Deck
                </Button>
              </DialogTrigger>
              <DialogContent className="min-card">
                <DialogHeader>
                  <DialogTitle className="min-text-title">Create New Deck</DialogTitle>
                </DialogHeader>
                <div className="min-spacing-sm py-4">
                  <Label htmlFor="name" className="min-text-caption">Deck Name</Label>
                  <Input
                    id="name"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    className="min-focus"
                  />
                  <Label htmlFor="description" className="min-text-caption">Description</Label>
                  <Input
                    id="description"
                    value={newDeckDesc}
                    onChange={(e) => setNewDeckDesc(e.target.value)}
                    className="min-focus"
                  />
                </div>
                <Button
                  onClick={handleCreateDeck}
                  disabled={createDeckMutation.isPending}
                  className="w-full min-focus"
                >
                  {createDeckMutation.isPending ? "Creating..." : "Create Deck"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          {decksWithStats && decksWithStats.length > 0 ? (
            <div className="min-grid-auto">
              {decksWithStats.map((deck) => (
                <div key={deck._id} className="min-card p-6">
                  <h3 className="min-text-title mb-2">{deck.name}</h3>
                  <p className="min-text-caption mb-4 truncate">
                    {deck.description || "No description"}
                  </p>
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="min-text-caption">
                      <Layers className="h-3 w-3 inline mr-1" />
                      {deck.cardCount} cards
                    </span>
                    <span className="min-text-caption">
                      <Target className="h-3 w-3 inline mr-1" />
                      {deck.cardsDue} due
                    </span>
                  </div>
                  <Link href={`/decks/${deck._id}`}>
                    <Button size="sm" className="w-full min-focus">
                      Study Now
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="min-card p-12 text-center">
              <h3 className="min-text-title mb-2">No decks yet</h3>
              <p className="min-text-caption mb-4">
                Start by creating your first deck or focus on collocations.
              </p>
              <Link href="/collocations">
                <Button variant="outline" className="min-focus">
                  Explore Collocations
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
