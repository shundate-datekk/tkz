import { Skeleton } from "@/components/ui/skeleton";

/**
 * ホームページのローディング状態
 */
export default function HomeLoading() {
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
        {/* ウェルカムセクション */}
        <div className="mb-12 text-center">
          <Skeleton className="mx-auto mb-4 h-12 w-96" />
          <Skeleton className="mx-auto h-6 w-64" />
        </div>

        {/* 機能カード */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <FeatureCardSkeleton key={i} />
          ))}
        </div>

        {/* 最近のツール */}
        <div className="mt-12">
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
      <Skeleton className="mx-auto mb-2 h-6 w-32" />
      <Skeleton className="mx-auto h-4 w-48" />
    </div>
  );
}

function ToolCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mb-4 h-16 w-full" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  );
}
