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
  BrainCircuit,
  History,
  Layers,
  PlusCircle,
  Target,
} from "lucide-react";

// Định nghĩa kiểu dữ liệu cho Deck
interface Deck {
  _id: string;
  name: string;
  description: string;
  cardCount?: number; // Sẽ thêm từ backend sau
  lastReviewed?: string; // Sẽ thêm từ backend sau
}

// Hàm fetch dữ liệu
const fetchDecks = async (): Promise<Deck[]> => {
  const { data } = await api.get("/decks");
  // Giả lập dữ liệu bổ sung, sau này sẽ thay bằng dữ liệu thật từ API
  return data.map((deck: Deck) => ({
    ...deck,
    cardCount: Math.floor(Math.random() * 100),
    lastReviewed: "Hôm qua",
  }));
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
  console.log("🚀 ~ DashboardClient ~ decks:", decks);

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

  if (!accessToken || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Đang tải...
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
        {/* === Section Thống kê & Hành động chính === */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cần ôn tập hôm nay
              </CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25 thẻ</div>
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
              <div className="text-2xl font-bold">10 / 20 thẻ mới</div>
              <p className="text-xs text-muted-foreground">
                Bạn đang làm rất tốt
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
              <div className="text-2xl font-bold">+350</div>
              <p className="text-xs text-muted-foreground">
                Kiến thức là sức mạnh
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

          {decks && decks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {decks.map((deck) => (
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
                      <History className="h-4 w-4" />
                      <span>Ôn tập lần cuối: {deck.lastReviewed}</span>
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
