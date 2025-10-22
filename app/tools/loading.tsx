import { Skeleton } from "@/components/ui/skeleton";

/**
 * AIツール一覧のローディング状態
 */
export default function ToolsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダースケルトン */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* タイトルとボタンのスケルトン */}
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* ツールカードグリッドのスケルトン */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ToolCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}

/**
 * ツールカードのスケルトン
 */
function ToolCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      {/* ヘッダー */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="mb-2 h-6 w-3/4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* 説明文 */}
      <Skeleton className="mb-4 h-16 w-full" />

      {/* メタ情報 */}
      <div className="flex items-center gap-4 text-sm">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* アクションボタン */}
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}
