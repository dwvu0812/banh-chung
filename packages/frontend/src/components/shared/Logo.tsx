import { Package } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <Package className="h-8 w-8 text-primary" />
      <div className="flex flex-col">
        <span className="font-bold text-lg tracking-tight">Bánh chưng</span>
        <span className="text-xs text-muted-foreground">
          Học từ vựng mỗi ngày
        </span>
      </div>
    </Link>
  );
}
