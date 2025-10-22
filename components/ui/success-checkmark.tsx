'use client';

import { motion } from 'motion/react';

/**
 * 成功時のチェックマークアニメーション
 * SVG描画エフェクトで視覚的フィードバック
 */
export function SuccessCheckmark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 円 */}
        <motion.circle
          cx="32"
          cy="32"
          r="30"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        
        {/* チェックマーク */}
        <motion.path
          d="M20 32 L28 40 L44 24"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

/**
 * インライン成功チェックマーク（小サイズ）
 */
export function SuccessCheckmarkSmall({ className }: { className?: string }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
    >
      <circle
        cx="10"
        cy="10"
        r="9"
        fill="hsl(var(--primary))"
      />
      <motion.path
        d="M6 10 L9 13 L14 7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
    </motion.svg>
  );
}
