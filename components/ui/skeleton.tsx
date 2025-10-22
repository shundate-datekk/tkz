import { cn } from "@/lib/utils";

/**
 * スケルトンローディングコンポーネント
 * コンテンツ読み込み中のプレースホルダー表示
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-skeleton bg-muted rounded", className)}
      {...props}
    />
  );
}
