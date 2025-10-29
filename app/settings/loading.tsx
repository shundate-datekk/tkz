import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";

/**
 * 設定ページのローディング状態
 * ストリーミング表示でUXを向上（Requirement 8.4）
 */
export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb Skeleton */}
        <Breadcrumb
          items={[
            { label: 'ホーム', href: '/' },
            { label: '設定' },
          ]}
          className="mb-4"
        />

        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        <div className="space-y-6">
          {/* テーマカード */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-48" />
            </CardContent>
          </Card>

          {/* データエクスポート */}
          <Skeleton className="h-[200px] w-full" />

          {/* データインポート */}
          <Skeleton className="h-[300px] w-full" />

          {/* データバックアップ */}
          <Skeleton className="h-[250px] w-full" />
        </div>
      </div>
    </div>
  );
}
