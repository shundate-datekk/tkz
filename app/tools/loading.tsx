import { SkeletonToolCard } from "@/components/ui/skeleton"

/**
 * ツール一覧ページのローディング表示
 * Next.js 15のストリーミング機能により自動的に表示される
 */
export default function ToolsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ページタイトル部分のスケルトン */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-96 animate-pulse rounded-md bg-muted" />
      </div>

      {/* ツールカードのグリッドレイアウト */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* 6個のスケルトンカードを表示 */}
        {[...Array(6)].map((_, index) => (
          <SkeletonToolCard key={index} />
        ))}
      </div>
    </div>
  )
}
