"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    // Nếu đã đăng nhập, chuyển hướng đến dashboard
    if (accessToken) {
      router.replace("/dashboard");
    }
  }, [accessToken, router]);

  // Nếu đã đăng nhập, hiển thị loading
  if (accessToken) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Đang chuyển hướng...</p>
      </div>
    );
  }

  // Landing page cho người chưa đăng nhập
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Bánh Chưng</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button>Đăng ký</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Master English Collocations
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Học tiếng Anh hiệu quả thông qua các cụm từ tự nhiên. 
            Nâng cao khả năng giao tiếp với hơn 200+ collocations thiết yếu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Bắt đầu học miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/collocations">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Xem collocations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>200+ Collocations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Học các cụm từ thiết yếu được tuyển chọn từ Oxford và Cambridge, 
                phân loại theo chủ đề từ cuộc sống hàng ngày đến business.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Học theo SRS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Hệ thống lặp lại ngắt quãng thông minh giúp bạn nhớ lâu hơn 
                và ôn tập đúng thời điểm.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Quiz & Kiểm tra</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Kiểm tra kiến thức với các bài quiz đa dạng: 
                trắc nghiệm, điền từ, ghép cặp.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Collocation Preview */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Ví dụ Collocations
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  make a decision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">đưa ra quyết định</p>
                <p className="text-sm italic">
                  "We need to make a decision about the project by Friday."
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  reach an agreement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">đạt được thỏa thuận</p>
                <p className="text-sm italic">
                  "The companies reached an agreement after negotiation."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Sẵn sàng cải thiện tiếng Anh?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Tham gia cùng hàng nghìn người học đang nâng cao khả năng giao tiếp 
            tiếng Anh thông qua collocations.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-3">
              Đăng ký ngay - Miễn phí
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 Bánh Chưng. Học collocations hiệu quả mỗi ngày.</p>
        </div>
      </footer>
    </div>
  );
}
