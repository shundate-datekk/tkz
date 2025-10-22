"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/lib/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * テーマ切り替えトグルコンポーネント
 * 
 * ライト/ダーク/システム連動の3択トグルを提供します。
 * Requirements: 9.2
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: "light" | "dark" | "system"; icon: typeof Sun; label: string }> = [
    { value: "light", icon: Sun, label: "ライト" },
    { value: "dark", icon: Moon, label: "ダーク" },
    { value: "system", icon: Monitor, label: "システム" },
  ];

  return (
    <div className={cn("inline-flex rounded-lg border p-1 gap-1", className)} role="group" aria-label="テーマ切り替え">
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={theme === value ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme(value)}
          aria-label={`${label}モードに切り替え`}
          aria-pressed={theme === value}
          className="gap-2"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}
