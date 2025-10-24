'use client';

import { PageTransition } from '@/components/ui/page-transition';

/**
 * アプリケーション全体のテンプレート
 * すべてのページにページ遷移アニメーションを適用
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
