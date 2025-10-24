import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbナビゲーションコンポーネント
 * 現在位置を階層的に表示し、各階層へのリンクを提供する
 *
 * @example
 * ```tsx
 * <Breadcrumb items={[
 *   { label: 'ホーム', href: '/' },
 *   { label: 'AIツール', href: '/tools' },
 *   { label: '編集' }
 * ]} />
 * ```
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="パンくずリスト"
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center space-x-1">
              {/* セパレーター（最初の要素以外） */}
              {!isFirst && (
                <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              )}

              {/* アイテム */}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-1"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isFirst && <Home className="h-4 w-4" aria-label="ホーム" />}
                  <span className="truncate max-w-[200px]">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1 px-1',
                    isLast && 'font-medium text-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isFirst && <Home className="h-4 w-4" aria-label="ホーム" />}
                  <span className="truncate max-w-[200px]">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
