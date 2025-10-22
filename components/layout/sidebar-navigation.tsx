"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, Sparkles, History, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-button";

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

interface SidebarNavigationProps {
  userName?: string;
}

export function SidebarNavigation({
  userName,
}: SidebarNavigationProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:flex flex-col">
      {/* Logo/Title */}
      <div className="border-b p-6">
        <Link
          href="/"
          className="text-xl font-bold hover:opacity-80 transition-opacity"
        >
          TKZ
        </Link>
        {userName && (
          <p className="mt-2 text-sm text-muted-foreground truncate">
            {userName}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2" aria-label="サイドバーナビゲーション">
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
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t p-4">
        <LogoutButton className="w-full justify-start gap-3" />
      </div>
    </aside>
  );
}
