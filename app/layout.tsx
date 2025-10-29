import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { WebVitals } from "@/components/analytics/web-vitals";
import { SessionManager } from "@/components/auth/session-manager";
import "./globals.css";

// フォント最適化（Requirement 8.6）
// next/font/googleで自動最適化、font-display: swapでテキストの即座表示
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  adjustFontFallback: true,
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"], // 日本語サブセットは自動的に含まれる
  display: "swap",
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "AI Tools & Sora Prompt Generator",
  description: "AIツール情報共有とSora2プロンプト自動生成アプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TKZ",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="font-sans">
        <Providers>
          {children}
          <Toaster position="top-center" />
          <SessionManager />
          <WebVitals />
        </Providers>
      </body>
    </html>
  );
}
