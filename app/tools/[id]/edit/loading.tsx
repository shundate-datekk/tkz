import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/ui/breadcrumb";

/**
 * ツール編集ページのローディング状態
 * ストリーミング表示でUXを向上（Requirement 8.4）
 */
export default function ToolEditLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Form Skeleton */}
        <Skeleton className="h-[600px] w-full" />
      </div>
    </div>
  );
}
