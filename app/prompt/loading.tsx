import { SkeletonForm } from "@/components/ui/skeleton"

/**
 * プロンプト生成ページのローディング表示
 * Next.js 15のストリーミング機能により自動的に表示される
 */
export default function PromptLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* ページタイトル部分のスケルトン */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded-md bg-muted" />
      </div>

      {/* フォームスケルトン */}
      <SkeletonForm />
    </div>
  )
}
