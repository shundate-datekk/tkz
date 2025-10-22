'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedLinkProps extends ComponentProps<typeof Link> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'underline';
}

/**
 * アニメーション付きリンクコンポーネント
 * ホバー時に滑らかなアンダーラインまたはスケール効果
 */
export function AnimatedLink({
  children,
  className,
  variant = 'default',
  ...props
}: AnimatedLinkProps) {
  if (variant === 'underline') {
    return (
      <Link
        {...props}
        className={cn('relative inline-block group', className)}
      >
        {children}
        <motion.span
          className="absolute bottom-0 left-0 h-[2px] bg-current"
          initial={{ width: 0 }}
          whileHover={{ width: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link {...props} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}
