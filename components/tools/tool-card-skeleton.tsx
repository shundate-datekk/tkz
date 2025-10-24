import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * ToolCard用のスケルトンスクリーン
 * ツールカードの読み込み中に形状を予告する
 */
export function ToolCardSkeleton() {
  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* ツール名 */}
            <Skeleton className="h-6 w-3/4" />
            {/* カテゴリー */}
            <Skeleton className="h-5 w-24" />
          </div>
          {/* 評価 */}
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 使用目的 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* 使用感 */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* 日付とアクションボタン */}
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ツールカードリスト用のスケルトングリッド
 * @param count - 表示するスケルトンの数（デフォルト: 6）
 */
export function ToolCardSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ToolCardSkeleton key={i} />
      ))}
    </div>
  );
}
