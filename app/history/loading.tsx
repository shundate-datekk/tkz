import { SkeletonPromptCard, SkeletonTable } from "@/components/ui/skeleton"

/**
 * プロンプト履歴ページのローディング表示
 * Next.js 15のストリーミング機能により自動的に表示される
 */
export default function HistoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ページタイトル部分のスケルトン */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-full max-w-xl animate-pulse rounded-md bg-muted" />
      </div>

      {/* タブ切り替え部分のスケルトン */}
      <div className="mb-6 flex gap-2">
        <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
      </div>

      {/* 履歴カードのグリッドレイアウト（デフォルトビュー） */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        {[...Array(4)].map((_, index) => (
          <SkeletonPromptCard key={index} />
        ))}
      </div>

      {/* または、テーブルビューのスケルトン（コメントアウト） */}
      {/* <SkeletonTable rows={8} /> */}
    </div>
  )
}
