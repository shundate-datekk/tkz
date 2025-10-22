"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, Sparkles, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "ホーム",
    shortName: "ホーム",
    href: "/",
    icon: Home,
  },
  {
    name: "AIツール",
    shortName: "ツール",
    href: "/tools",
    icon: Wrench,
  },
  {
    name: "プロンプト生成",
    shortName: "プロンプト",
    href: "/prompt",
    icon: Sparkles,
  },
  {
    name: "履歴",
    shortName: "履歴",
    href: "/history",
    icon: History,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
      aria-label="モバイルナビゲーション"
    >
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.shortName}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
