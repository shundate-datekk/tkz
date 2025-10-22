'use client';

import { motion } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';
import { useAnimation } from '@/lib/providers/animation-provider';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * アニメーションボタンのProps
 */
interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  /** ボタンのバリアント */
  variant?: 'primary' | 'secondary' | 'accent';
}

/**
 * アニメーション付きボタンコンポーネント
 *
 * ホバー、タップ時のスケールアニメーションを提供します。
 * reduced-motion設定に対応し、アクセシビリティに配慮しています。
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, variant = 'primary', className, ...props }, ref) => {
    const { transitionConfig } = useAnimation();

    const variantStyles = {
      primary: 'bg-gradient-primary text-white',
      secondary: 'bg-secondary text-secondary-foreground',
      accent: 'bg-gradient-accent text-white',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'px-6 py-3 rounded-xl font-medium shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={transitionConfig}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
