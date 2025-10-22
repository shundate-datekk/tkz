"use client";

import { SessionProvider } from "next-auth/react";
import { AnimationProvider } from "@/lib/providers/animation-provider";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";

/**
 * Providers Component
 * NextAuth.js v5 SessionProvider, AnimationProvider, ThemeProvider をラップ
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AnimationProvider>
          {children}
          <Toaster />
        </AnimationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
