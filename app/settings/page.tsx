import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DataExport } from "@/components/settings/data-export";
import { DataImport } from "@/components/settings/data-import";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 設定ページ
 * テーマ設定、データエクスポート/インポート機能を提供
 */
export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">設定</h1>
        <p className="text-muted-foreground">
          アプリケーションの設定を管理します
        </p>
      </div>

      <div className="space-y-6">
        {/* テーマ設定 */}
        <Card>
          <CardHeader>
            <CardTitle>テーマ</CardTitle>
            <CardDescription>
              アプリケーションの表示テーマを変更できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>

        {/* データエクスポート */}
        <DataExport />

        {/* データインポート */}
        <DataImport />
      </div>
    </div>
  );
}
