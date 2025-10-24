"use client";

import { useState, useTransition, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/lib/toast";
import { importToolsDataAction } from "@/lib/actions/data-management.actions";

/**
 * データインポートコンポーネント
 * JSONファイルからAIツールデータをインポートする
 *
 * Requirements: 10.3, 10.4, 10.5
 */
export function DataImport() {
  const [isPending, startTransition] = useTransition();
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // ファイルサイズチェック（10MB制限）
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ファイルサイズが大きすぎます", {
        description: "10MB以下のファイルを選択してください",
      });
      return;
    }

    // JSON形式チェック
    if (!file.name.endsWith(".json")) {
      toast.error("JSON形式のファイルを選択してください");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;

      try {
        const parsed = JSON.parse(content);

        // 基本的なバリデーション
        if (!parsed.tools || !Array.isArray(parsed.tools)) {
          toast.error("無効なファイル形式です", {
            description: "tools配列が見つかりません",
          });
          return;
        }

        setFileContent(content);
        setPreviewData(parsed);
        setShowPreview(true);
      } catch (error) {
        toast.error("JSON形式が無効です");
      }
    };

    reader.onerror = () => {
      toast.error("ファイルの読み込みに失敗しました");
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    startTransition(async () => {
      try {
        const result = await importToolsDataAction(fileContent);

        if (!result.success) {
          toast.error(result.error || "インポートに失敗しました");
          return;
        }

        const { importedCount, skippedCount, errors } = result.data!;

        setShowPreview(false);
        setPreviewData(null);
        setFileContent("");

        // ファイル入力をリセット
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        if (errors.length > 0) {
          toast.warning(`${importedCount}件をインポートしました`, {
            description: `${skippedCount}件をスキップしました。詳細はコンソールを確認してください。`,
          });
          console.warn("Import errors:", errors);
        } else {
          toast.success(`${importedCount}件のツールをインポートしました`);
        }

        // ページをリロードしてデータを反映
        window.location.reload();
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("インポート中にエラーが発生しました");
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>データインポート</CardTitle>
          <CardDescription>
            JSON形式のファイルからAIツールデータをインポートできます。
            エクスポートしたデータや他の環境からのデータを読み込めます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              インポートするとデータが追加されます。既存のデータは削除されません。
            </AlertDescription>
          </Alert>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="import-file-input"
            />
            <label htmlFor="import-file-input">
              <Button asChild variant="outline" className="gap-2 cursor-pointer">
                <span>
                  <Upload className="h-4 w-4" />
                  JSONファイルを選択
                </span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* プレビューダイアログ */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>インポートプレビュー</DialogTitle>
            <DialogDescription>
              以下のデータをインポートします。確認してください。
            </DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>
                  {previewData.tools.length}件のツール | エクスポート日時:{" "}
                  {previewData.exportedAt ? new Date(previewData.exportedAt).toLocaleString("ja-JP") : "不明"}
                </span>
              </div>

              <div className="rounded-lg border p-4 max-h-96 overflow-y-auto">
                <ul className="space-y-2">
                  {previewData.tools.slice(0, 10).map((tool: any, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{tool.tool_name}</div>
                        <div className="text-muted-foreground">
                          {tool.category} | 評価: {"⭐".repeat(tool.rating)}
                        </div>
                      </div>
                    </li>
                  ))}
                  {previewData.tools.length > 10 && (
                    <li className="text-sm text-muted-foreground">
                      他 {previewData.tools.length - 10}件...
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              disabled={isPending}
            >
              キャンセル
            </Button>
            <Button onClick={handleImport} disabled={isPending}>
              {isPending ? "インポート中..." : `${previewData?.tools.length}件をインポート`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
