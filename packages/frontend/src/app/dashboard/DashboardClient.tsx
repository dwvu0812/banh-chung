"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

interface Deck {
  _id: string;
  name: string;
  description: string;
}

const fetchDecks = async (): Promise<Deck[]> => {
  const { data } = await api.get("/decks");
  return data;
};

export default function DashboardClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, logout } = useAuthStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDesc, setNewDeckDesc] = useState("");

  useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  const { data: decks, isLoading } = useQuery<Deck[]>({
    queryKey: ["decks"],
    queryFn: fetchDecks,
    enabled: !!accessToken,
  });

  const createDeckMutation = useMutation({
    mutationFn: (newDeck: { name: string; description: string }) =>
      api.post("/decks", newDeck), //
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
    <div className="container mx-auto p-4 md:p-10">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
        <Button onClick={logout} variant="outline">
          Đăng xuất
        </Button>
      </header>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Bộ thẻ của bạn</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Tạo bộ thẻ mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo bộ thẻ mới</DialogTitle>
                <DialogDescription>
                  Điền tên và mô tả cho bộ thẻ.
                </DialogDescription>
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
              <DialogFooter>
                <Button
                  onClick={handleCreateDeck}
                  disabled={createDeckMutation.isPending}
                >
                  {createDeckMutation.isPending ? "Đang tạo..." : "Tạo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {decks && decks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Card
                key={deck._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle>{deck.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {deck.description || "Không có mô tả"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-10 border-2 border-dashed rounded-lg">
            <p>Bạn chưa có bộ thẻ nào. Hãy tạo một cái mới!</p>
          </div>
        )}
      </section>
    </div>
  );
}
