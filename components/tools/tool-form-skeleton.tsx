import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * ToolForm用のスケルトンスクリーン
 * フォーム読み込み中に形状を予告する
 */
export function ToolFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ツール名フィールド */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* カテゴリーフィールド */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* 使用目的フィールド */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* 使用感フィールド */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* 評価フィールド */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* 使用日フィールド */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-48" />
        </div>

        {/* ボタン */}
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
