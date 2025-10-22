'use client';

import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * ページ遷移アニメーション
 * フェードイン・スライドアップ効果
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1], // cubic-bezier easing
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * スケルトンローディング用のプレースホルダー
 */
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-muted rounded animate-pulse ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
