import { Skeleton } from "@/components/ui/skeleton";

/**
 * プロンプト生成ページのローディング状態
 */
export default function PromptLoading() {
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* タイトル */}
        <Skeleton className="mb-8 h-9 w-64" />

        {/* フォーム */}
        <div className="rounded-lg border bg-card p-6 space-y-6">
          {/* シーンタイプ */}
          <div>
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* 被写体 */}
          <div>
            <Skeleton className="mb-2 h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* アクション */}
          <div>
            <Skeleton className="mb-2 h-5 w-28" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* 背景設定 */}
          <div>
            <Skeleton className="mb-2 h-5 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* カメラ設定 */}
          <div>
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* ムード・雰囲気 */}
          <div>
            <Skeleton className="mb-2 h-5 w-36" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* ボタン */}
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* 結果エリア */}
        <div className="mt-8 rounded-lg border bg-card p-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
      </main>
    </div>
  );
}
