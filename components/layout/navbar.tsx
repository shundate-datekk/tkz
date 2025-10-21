"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, Sparkles, History, Menu } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavbarProps {
  userName?: string;
}

const navItems = [
  {
    name: "ホーム",
    href: "/",
    icon: Home,
  },
  {
    name: "AIツール",
    href: "/tools",
    icon: Wrench,
  },
  {
    name: "プロンプト生成",
    href: "/prompt",
    icon: Sparkles,
  },
  {
    name: "履歴",
    href: "/history",
    icon: History,
  },
];

export function Navbar({ userName }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* ロゴ */}
          <Link
            href="/"
            className="flex-shrink-0 text-base md:text-xl font-bold hover:opacity-80"
          >
            <span className="hidden md:inline">AI Tools & Sora Prompt Generator</span>
            <span className="md:hidden">AI Tools</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* デスクトップユーザー情報 */}
          <div className="hidden md:flex items-center gap-3">
            {userName && (
              <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                {userName}
              </span>
            )}
            <LogoutButton />
          </div>

          {/* モバイルハンバーガーメニュー */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="メニューを開く">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle>メニュー</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {/* モバイルナビゲーション */}
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                {/* モバイルユーザー情報 */}
                {userName && (
                  <div className="mt-4 border-t pt-4">
                    <div className="mb-3 text-sm text-muted-foreground">
                      ログイン中: <span className="font-medium text-foreground">{userName}</span>
                    </div>
                    <LogoutButton className="w-full" />
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
