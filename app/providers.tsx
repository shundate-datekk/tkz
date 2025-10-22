"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";

/**
 * Providers Component
 * NextAuth.js v5 SessionProvider, ThemeProvider をラップ
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
