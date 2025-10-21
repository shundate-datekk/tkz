"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Providers Component
 * NextAuth.js v5 SessionProviderをラップ
 */
export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
