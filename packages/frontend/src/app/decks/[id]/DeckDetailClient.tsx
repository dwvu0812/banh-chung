"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardList } from "@/components/deck/CardList";
import { CardForm } from "@/components/deck/CardForm";
import {
  ArrowLeft,
  PlusCircle,
  Play,
  Layers,
  Target,
  TrendingUp,
} from "lucide-react";

interface Deck {
  _id: string;
  name: string;
  description: string;
}

interface FlashCard {
  _id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  examples?: string[];
}

interface DeckStats {
  totalCards: number;
  cardsDue: number;
  masteredCards: number;
  newCards: number;
  masteryPercentage: number;
}

export default function DeckDetailClient({ deckId }: { deckId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { accessToken, logout } = useAuthStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);

  // Fetch deck
  const { data: deck, isLoading: isDeckLoading } = useQuery<Deck>({
    queryKey: ["deck", deckId],
    queryFn: async () => {
      const { data } = await api.get(`/decks/${deckId}`);
      return data;
    },
    enabled: !!accessToken,
  });

  // Fetch cards
  const { data: cards = [], isLoading: isCardsLoading } = useQuery<FlashCard[]>(
    {
      queryKey: ["cards", deckId],
      queryFn: async () => {
        const { data } = await api.get(`/decks/${deckId}/cards`);
        return data;
      },
      enabled: !!accessToken,
    }
  );

  // Fetch deck stats
  const { data: stats } = useQuery<DeckStats>({
    queryKey: ["deckStats", deckId],
    queryFn: async () => {
      const { data } = await api.get(`/stats/deck/${deckId}`);
      return data;
    },
    enabled: !!accessToken,
  });

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: (newCard: Omit<FlashCard, "_id">) =>
      api.post(`/decks/${deckId}/cards`, newCard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", deckId] });
      queryClient.invalidateQueries({ queryKey: ["deckStats", deckId] });
      setIsFormOpen(false);
      toast.success("Card created successfully!");
    },
    onError: () => {
      toast.error("Failed to create card");
    },
  });

  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: ({
      cardId,
      data,
    }: {
      cardId: string;
      data: Partial<FlashCard>;
    }) => api.put(`/cards/${cardId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", deckId] });
      setIsFormOpen(false);
      setEditingCard(null);
      toast.success("Card updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update card");
    },
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => api.delete(`/cards/${cardId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", deckId] });
      queryClient.invalidateQueries({ queryKey: ["deckStats", deckId] });
      toast.success("Card deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete card");
    },
  });

  const handleCreateCard = (cardData: Omit<FlashCard, "_id">) => {
    createCardMutation.mutate(cardData);
  };

  const handleUpdateCard = (cardData: Partial<FlashCard>) => {
    if (editingCard) {
      updateCardMutation.mutate({ cardId: editingCard._id, data: cardData });
    }
  };

  const handleEditCard = (card: FlashCard) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm("Are you sure you want to delete this card?")) {
      deleteCardMutation.mutate(cardId);
    }
  };

  const handleStartReview = () => {
    router.push(`/review?deckId=${deckId}`);
  };

  if (!accessToken) {
    return null;
  }

  if (isDeckLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-current border-t-transparent" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Logo />
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Deck not found</h1>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <Logo />
        <div className="ml-auto">
          <Button onClick={logout} variant="outline">
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Deck Header */}
        <div>
          <h1 className="text-3xl font-bold">{deck.name}</h1>
          <p className="text-muted-foreground">{deck.description}</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Cards
                </CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCards}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due Today</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cardsDue}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mastered</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.masteredCards}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.masteryPercentage.toFixed(0)}% mastery
                </p>
              </CardContent>
            </Card>

            <Card
              className="flex flex-col justify-center items-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              onClick={handleStartReview}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Play className="h-8 w-8 mb-2" />
                <div className="text-lg font-bold">Start Review</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cards Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Cards</h2>
            <Button
              size="sm"
              onClick={() => {
                setEditingCard(null);
                setIsFormOpen(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>

          {isCardsLoading ? (
            <div className="text-center py-12">Loading cards...</div>
          ) : (
            <CardList
              cards={cards}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          )}
        </div>
      </main>

      {/* Card Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCard ? "Edit Card" : "Create New Card"}
            </DialogTitle>
          </DialogHeader>
          <CardForm
            card={editingCard || undefined}
            onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingCard(null);
            }}
            isLoading={
              createCardMutation.isPending || updateCardMutation.isPending
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
