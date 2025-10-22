import { SkeletonDetail } from "@/components/ui/skeleton"

/**
 * ツール詳細ページのローディング表示
 * Next.js 15のストリーミング機能により自動的に表示される
 */
export default function ToolDetailLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* 詳細ページスケルトン */}
      <SkeletonDetail />
    </div>
  )
}
