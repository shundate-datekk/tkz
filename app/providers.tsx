"use client";

import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";

/**
 * Providers Component
 * NextAuth.js v5 SessionProvider, ThemeProvider, SWRConfig をラップ
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          // Global SWR settings
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          dedupingInterval: 2000,
          focusThrottleInterval: 5000,
          loadingTimeout: 3000,

          // Cache configuration
          revalidateIfStale: true,

          // Error retry configuration
          errorRetryCount: 3,
          errorRetryInterval: 1000,
          shouldRetryOnError: true,

          // Error handler
          onError: (error, key) => {
            console.error(`SWR Error [${key}]:`, error);
          },

          // Success handler for debugging (optional, can be removed in production)
          onSuccess: (data, key) => {
            if (process.env.NODE_ENV === 'development') {
              console.log(`SWR Success [${key}]:`, data);
            }
          },
        }}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </SWRConfig>
    </SessionProvider>
  );
}
