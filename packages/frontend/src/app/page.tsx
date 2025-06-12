"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ Zustand store
    if (accessToken) {
      // Nếu có token, chuyển hướng đến dashboard
      router.replace("/dashboard");
    } else {
      // Nếu không có token, chuyển hướng đến trang đăng nhập
      router.replace("/login");
    }
  }, [accessToken, router]);

  // Hiển thị một thông báo tạm thời trong khi chuyển hướng
  return (
    <div className="flex h-screen items-center justify-center">
      <p>Đang chuyển hướng...</p>
    </div>
  );
}
