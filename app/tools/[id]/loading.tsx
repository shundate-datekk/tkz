import { Skeleton } from "@/components/ui/skeleton"

/**
 * ツール詳細ページのローディング表示
 */
export default function ToolDetailLoading() {
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

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* 戻るボタン */}
        <Skeleton className="mb-6 h-10 w-24" />

        {/* タイトルとアクション */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="mb-2 h-8 w-3/4" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* 詳細情報カード */}
        <div className="rounded-lg border bg-card p-6 space-y-6">
          <div>
            <Skeleton className="mb-2 h-5 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div>
            <Skeleton className="mb-2 h-5 w-20" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div>
            <Skeleton className="mb-2 h-5 w-28" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div>
            <Skeleton className="mb-2 h-5 w-24" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      </main>
    </div>
  )
}
