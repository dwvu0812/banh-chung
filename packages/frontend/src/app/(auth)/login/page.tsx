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

// State & API
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { AxiosError } from "axios";

// Assets
import loginBg from "../../../../public/login.jpg";
import { AtSign, Lock } from "lucide-react";

const formSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email không được để trống." })
    .email({ message: "Địa chỉ email không hợp lệ." }),
  password: z
    .string()
    .min(1, { message: "Mật khẩu không được để trống." })
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }),
});

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  // Hàm submit được đơn giản hóa với sonner
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await api.post("/auth/login", values);
      setToken(res.data.accessToken);

      // <<<< THAY ĐỔI QUAN TRỌNG: Gọi toast.success
      toast.success("Đăng nhập thành công!", {
        description: "Đang chuyển hướng đến bảng điều khiển...",
      });

      router.push("/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<{ msg: string }>;
      const errorMessage =
        axiosError.response?.data?.msg ||
        "Email hoặc mật khẩu không chính xác.";

      // <<<< THAY ĐỔI QUAN TRỌNG: Gọi toast.error
      toast.error("Đăng nhập thất bại", {
        description: errorMessage,
      });
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* Phần JSX không có thay đổi lớn */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Chào mừng trở lại!
            </h1>
            <p className="text-balance text-muted-foreground mt-2">
              Đăng nhập để tiếp tục hành trình của bạn
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="text-right">
                <Link
                  href="#"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>

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
