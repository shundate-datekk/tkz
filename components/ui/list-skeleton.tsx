import { Skeleton } from '@/components/ui/skeleton';

/**
 * リストアイテム用のスケルトン
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border">
      {/* アイコン/画像 */}
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />

      {/* コンテンツ */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* アクション */}
      <Skeleton className="h-9 w-20 flex-shrink-0" />
    </div>
  );
}

/**
 * リスト用のスケルトン
 * @param count - 表示するスケルトンの数（デフォルト: 5）
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}
