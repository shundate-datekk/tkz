"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // 開発環境でコンソールに出力
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
      });
    }

    // 本番環境では分析サービスに送信（例：Google Analytics）
    if (process.env.NODE_ENV === "production") {
      // Google Analytics 4の例
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", metric.name, {
          event_category: "Web Vitals",
          value: Math.round(
            metric.name === "CLS" ? metric.value * 1000 : metric.value
          ),
          event_label: metric.id,
          non_interaction: true,
        });
      }

      // Vercel Analyticsの例
      // import { sendGAEvent } from '@next/third-parties/google'
      // sendGAEvent({ event: metric.name, value: metric.value })
    }
  });

  return null;
}
