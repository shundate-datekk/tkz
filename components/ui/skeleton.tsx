import { cn } from "@/lib/utils"

/**
 * 基本スケルトンコンポーネント
 * ローディング中のプレースホルダーとして使用
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

/**
 * ToolCard形状のスケルトン
 * ツール一覧ページで使用
 */
function SkeletonToolCard() {
  return (
    <div className="flex flex-col space-y-3 rounded-lg border border-border p-6 shadow-sm">
      {/* ヘッダー部分 */}
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-16" />
      </div>

      {/* 説明文 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* カテゴリーとタグ */}
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* フッター（日時等） */}
      <div className="flex items-center gap-4 pt-2 text-sm">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  )
}

/**
 * PromptHistoryCard形状のスケルトン
 * プロンプト履歴ページで使用
 */
function SkeletonPromptCard() {
  return (
    <div className="flex flex-col space-y-3 rounded-lg border border-border p-6 shadow-sm">
      {/* タイトル */}
      <Skeleton className="h-6 w-2/3" />

      {/* プロンプト内容 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      {/* メタデータ */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  )
}

/**
 * フォームレイアウトのスケルトン
 * フォームページで使用
 */
function SkeletonForm() {
  return (
    <div className="space-y-6 rounded-lg border border-border p-6">
      {/* フォームタイトル */}
      <Skeleton className="h-8 w-48" />

      {/* フォームフィールド x 4 */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}

      {/* Textareaフィールド */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  )
}

/**
 * テーブルレイアウトのスケルトン
 * テーブルページで使用
 * @param rows 表示する行数（デフォルト: 5）
 */
function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border">
      {/* テーブルヘッダー */}
      <div className="flex items-center gap-4 border-b border-border bg-muted/50 px-6 py-4">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-1/6" />
        <Skeleton className="h-5 w-1/6" />
      </div>

      {/* テーブル行 */}
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-b-0"
        >
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/6" />
          <Skeleton className="h-5 w-1/6" />
        </div>
      ))}
    </div>
  )
}

/**
 * 詳細ページのスケルトン
 * ツール詳細ページ等で使用
 */
function SkeletonDetail() {
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>

      {/* メタ情報 */}
      <div className="flex gap-4">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* メインコンテンツ */}
      <div className="space-y-4 rounded-lg border border-border p-6">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>

      {/* 追加情報セクション */}
      <div className="space-y-4 rounded-lg border border-border p-6">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonToolCard,
  SkeletonPromptCard,
  SkeletonForm,
  SkeletonTable,
  SkeletonDetail,
}
