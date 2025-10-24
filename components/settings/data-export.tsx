"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { exportToolsDataAction } from "@/lib/actions/data-management.actions";

/**
 * データエクスポートコンポーネント
 * 全AIツールデータをJSON形式でエクスポートする
 *
 * Requirements: 10.1, 10.2
 */
export function DataExport() {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      try {
        const result = await exportToolsDataAction();

        if (!result.success || !result.data) {
          toast.error(result.error || "エクスポートに失敗しました");
          return;
        }

        // タイムスタンプ付きファイル名を生成
        const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
        const filename = `tkz-tools-${timestamp}.json`;

        // JSONデータを生成
        const jsonData = JSON.stringify(result.data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });

        // ダウンロードリンクを作成してクリック
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`${result.data.totalCount}件のツールをエクスポートしました`, {
          description: `ファイル名: ${filename}`,
        });
      } catch (error) {
        console.error("Export failed:", error);
        toast.error("エクスポート中にエラーが発生しました");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>データエクスポート</CardTitle>
        <CardDescription>
          登録したAIツールをJSON形式でエクスポートできます。
          バックアップや他の環境への移行に使用できます。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleExport}
          disabled={isPending}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isPending ? "エクスポート中..." : "JSON形式でエクスポート"}
        </Button>
      </CardContent>
    </Card>
  );
}
