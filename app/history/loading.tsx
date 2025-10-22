import { Skeleton } from "@/components/ui/skeleton"

/**
 * プロンプト履歴ページのローディング表示
 */
export default function HistoryLoading() {
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
        {/* タイトル */}
        <Skeleton className="mb-8 h-8 w-56" />

        {/* タブ */}
        <div className="mb-6 flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* プロンプトカード */}
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <PromptCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}

function PromptCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="mb-4 h-6 w-3/4" />
      <Skeleton className="mb-4 h-24 w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  )
}
