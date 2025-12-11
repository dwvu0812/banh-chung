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
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* === Header === */}
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <Logo />
        <div className="ml-auto">
          <Button onClick={logout} variant="outline">
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* === Collocation Learning - Main Feature === */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            English Collocations Learning
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-full lg:col-span-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Start Learning Collocations</h3>
                    <p className="text-blue-100 mb-4">
                      Master English through natural word combinations
                    </p>
                    <div className="flex gap-3">
                      <Button asChild variant="secondary" size="lg">
                        <Link href="/collocations">
                          Browse Collocations
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
                        <Link href="/collocations/review">
                          Start Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <BookOpen className="h-24 w-24 text-white/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Available:</span>
                    <span className="text-2xl font-bold text-primary">
                      {stats?.collocation?.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Due Today:</span>
                    <span className="text-lg font-semibold text-orange-600">
                      {stats?.collocation?.dueToday || 0}
                    </span>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/collocations">View All</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* === Section Thống kê & Hành động phụ === */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cần ôn tập hôm nay
              </CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.cardsDueToday || 0} thẻ
              </div>
              <p className="text-xs text-muted-foreground">
                Sẵn sàng để chinh phục!
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mục tiêu ngày
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.newCardsToday || 0} thẻ mới
              </div>
              <p className="text-xs text-muted-foreground">
                Hôm nay
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng số từ đã học
              </CardTitle>
              <BrainCircuit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalCards || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Tổng số từ
              </p>
            </CardContent>
          </Card>
          <Card className="flex flex-col justify-center items-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Link href="/review" className="w-full h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="text-2xl font-bold">Bắt đầu ôn tập</div>
                <p className="text-xs text-primary-foreground/80">
                  Thử thách trí nhớ của bạn
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* === Quiz Performance === */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Quiz Performance
          </h3>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/quiz">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  Test Your Knowledge
                </CardTitle>
                <Trophy className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {stats?.quiz?.totalTaken || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Quizzes Taken</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.quiz?.averageScore || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Average Score</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button variant="outline" className="w-full">
                      Take a Quiz
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* === Section Quản lý bộ thẻ === */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Tất cả bộ thẻ</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Tạo bộ thẻ mới
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo bộ thẻ mới</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="name">Tên bộ thẻ</Label>
                  <Input
                    id="name"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                  />
                  <Label htmlFor="description">Mô tả</Label>
                  <Input
                    id="description"
                    value={newDeckDesc}
                    onChange={(e) => setNewDeckDesc(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleCreateDeck}
                  disabled={createDeckMutation.isPending}
                  className="w-full"
                >
                  {createDeckMutation.isPending ? "Đang tạo..." : "Tạo"}
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          {decksWithStats && decksWithStats.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {decksWithStats.map((deck) => (
                <Card key={deck._id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{deck.name}</CardTitle>
                    <CardDescription className="truncate">
                      {deck.description || "Không có mô tả"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>{deck.cardCount} thẻ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>{deck.cardsDue} cần ôn tập</span>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-2 mt-auto">
                    <Button asChild className="w-full">
                      <Link href={`/decks/${deck._id}`}>
                        Học ngay
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-20">
              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                  Bạn chưa có bộ thẻ nào
                </h3>
                <p className="text-sm text-muted-foreground">
                  Hãy bắt đầu bằng cách tạo một bộ thẻ mới.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
