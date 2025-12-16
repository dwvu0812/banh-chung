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
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="min-border-bottom">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="min-text-title">Bánh Chưng</span>
            </div>
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="min-button-ghost min-focus">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="min-focus">
                  Đăng ký
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Clean Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto min-spacing-lg">
          <h1 className="min-text-display text-4xl md:text-5xl mb-6 text-foreground">
            Master English Collocations
          </h1>
          <p className="min-text-body text-muted-foreground mb-12 max-w-xl mx-auto">
            Học tiếng Anh hiệu quả thông qua các cụm từ tự nhiên. 
            Nâng cao khả năng giao tiếp với hơn 200+ collocations thiết yếu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Link href="/register" className="flex-1">
              <Button size="lg" className="w-full min-focus">
                Bắt đầu học
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/collocations" className="flex-1">
              <Button variant="outline" size="lg" className="w-full min-focus">
                Khám phá
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center min-spacing-sm">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="min-text-title mb-3">200+ Collocations</h3>
              <p className="min-text-caption">
                Học các cụm từ thiết yếu được tuyển chọn từ Oxford và Cambridge, 
                phân loại theo chủ đề từ cuộc sống hàng ngày đến business.
              </p>
            </div>

            <div className="text-center min-spacing-sm">
              <Users className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="min-text-title mb-3">Học theo SRS</h3>
              <p className="min-text-caption">
                Hệ thống lặp lại ngắt quãng thông minh giúp bạn nhớ lâu hơn 
                và ôn tập đúng thời điểm.
              </p>
            </div>

            <div className="text-center min-spacing-sm">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="min-text-title mb-3">Quiz & Kiểm tra</h3>
              <p className="min-text-caption">
                Kiểm tra kiến thức với các bài quiz đa dạng: 
                trắc nghiệm, điền từ, ghép cặp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Collocation Preview */}
      <section className="min-border-top bg-muted/20">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto text-center min-spacing-lg">
            <h2 className="min-text-display mb-12">
              Ví dụ Collocations
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="min-card p-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <h3 className="min-text-title">make a decision</h3>
                </div>
                <p className="min-text-caption mb-3">đưa ra quyết định</p>
                <p className="min-text-caption italic">
                  "We need to make a decision about the project by Friday."
                </p>
              </div>

              <div className="min-card p-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <h3 className="min-text-title">reach an agreement</h3>
                </div>
                <p className="min-text-caption mb-3">đạt được thỏa thuận</p>
                <p className="min-text-caption italic">
                  "The companies reached an agreement after negotiation."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-xl mx-auto min-spacing-md">
          <h2 className="min-text-display mb-6">
            Sẵn sàng cải thiện tiếng Anh?
          </h2>
          <p className="min-text-body text-muted-foreground mb-8">
            Tham gia cùng hàng nghìn người học đang nâng cao khả năng giao tiếp 
            tiếng Anh thông qua collocations.
          </p>
          <Link href="/register">
            <Button size="lg" className="min-focus">
              Đăng ký ngay - Miễn phí
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="min-border-top bg-muted/10">
        <div className="container mx-auto px-6 py-6 text-center">
          <p className="min-text-caption">
            &copy; 2024 Bánh Chưng. Học collocations hiệu quả mỗi ngày.
          </p>
        </div>
      </footer>
    </div>
  );
}
