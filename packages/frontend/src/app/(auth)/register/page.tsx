"use client";

// Core imports
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Form validation imports
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Logo } from "@/components/shared/Logo";

// API
import api from "@/lib/api";
import { AxiosError } from "axios";

// Assets
import loginBg from "../../../../public/login.jpg";
import { AtSign, Lock, User } from "lucide-react";

// Định nghĩa schema validation cho form đăng ký
const formSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: "Tên người dùng phải có ít nhất 3 ký tự." }),
  email: z.string().trim().email({ message: "Địa chỉ email không hợp lệ." }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
});

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await api.post("/auth/register", values);
      toast.success("Đăng ký thành công!", {
        description: "Bạn sẽ được chuyển đến trang đăng nhập.",
      });
      router.push("/login");
    } catch (err) {
      const axiosError = err as AxiosError<{ msg: string }>;
      toast.error("Đăng ký thất bại", {
        description: axiosError.response?.data?.msg || "Đã có lỗi xảy ra.",
      });
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* --- Phần Form đăng ký --- */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* ==== THÊM MỚI: Logo và Slogan ==== */}
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          {/* ================================== */}
          <div className="mb-6 text-left">
            <h1 className="text-2xl font-bold tracking-tight">
              Tạo tài khoản mới
            </h1>
            <p className="text-balance text-muted-foreground mt-1">
              Chỉ một bước nữa để bắt đầu học tập hiệu quả
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên người dùng</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Tên của bạn"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="email@example.com"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      {/* --- Phần Branding (tương tự trang login) --- */}
      <div className="hidden lg:block relative">
        <Image
          src={loginBg}
          alt="Learning environment"
          fill
          style={{ objectFit: "cover" }}
          className="brightness-[0.4]"
        />
        <div className="relative z-10 flex flex-col justify-end h-full p-12 text-white">
          <div className="w-fit bg-black bg-opacity-40 p-6 rounded-xl backdrop-blur-sm">
            <h2 className="text-3xl font-bold">
              &quot;The beautiful thing about learning is that no one can take
              it away from you.&quot;
            </h2>
            <p className="text-gray-300 mt-4">- B.B. King</p>
          </div>
        </div>
      </div>
    </div>
  );
}
