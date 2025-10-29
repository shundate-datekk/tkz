import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  // セキュリティヘッダーの設定
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // 画像最適化設定（Requirement 8.2）
  images: {
    // WebP/AVIF形式への自動変換を有効化（デフォルトで有効）
    formats: ["image/avif", "image/webp"],

    // デバイスサイズ（レスポンシブ画像用）
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // 画像サイズ（アイコンやサムネイル用）
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // 外部ドメインの画像を使用する場合はここに追加
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "example.com",
    //     pathname: "/images/**",
    //   },
    // ],

    // 注: 画像の品質(quality)はコンポーネントレベルで指定
    // <OptimizedImage quality={80} ... />
  },

  // Server Actionsの設定
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
});

export default withSerwist(nextConfig);
