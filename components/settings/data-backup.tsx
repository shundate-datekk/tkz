"use client";

import { useState, useTransition, useEffect } from "react";
import { Download, Upload, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/lib/toast";
import {
  createBackupAction,
  listBackupsAction,
  restoreBackupAction,
  type Backup,
} from "@/lib/actions/backup.actions";

/**
 * データバックアップコンポーネント
 * 手動バックアップ作成、バックアップ一覧表示、復元機能を提供
 *
 * Requirements: 10.6, 10.7, 10.8
 */
export function DataBackup() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  // バックアップ一覧を取得
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setIsLoading(true);
    const result = await listBackupsAction();
    if (result.success && result.data) {
      setBackups(result.data);
    }
    setIsLoading(false);
  };

  // バックアップ作成
  const handleCreateBackup = () => {
    startTransition(async () => {
      try {
        const result = await createBackupAction();

        if (!result.success || !result.data) {
          toast.error(result.error || "バックアップ作成に失敗しました");
          return;
        }

        toast.success(
          `バックアップを作成しました（ツール${result.data.toolCount}件、プロンプト${result.data.promptCount}件）`,
          {
            description: `作成日時: ${new Date(result.data.createdAt).toLocaleString("ja-JP")}`,
          }
        );

        // リストを再読み込み
        await loadBackups();
      } catch (error) {
        console.error("Backup creation failed:", error);
        toast.error("バックアップ作成中にエラーが発生しました");
      }
    });
  };

  // 復元確認ダイアログを開く
  const openRestoreDialog = (backup: Backup) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
  };

  // バックアップ復元
  const handleRestore = async () => {
    if (!selectedBackup) return;

    setRestoreDialogOpen(false);

    startTransition(async () => {
      try {
        const result = await restoreBackupAction(selectedBackup.id);

        if (!result.success || !result.data) {
          toast.error(result.error || "復元に失敗しました");
          return;
        }

        toast.success(
          `データを復元しました（ツール${result.data.restoredToolCount}件、プロンプト${result.data.restoredPromptCount}件）`
        );

        setSelectedBackup(null);
      } catch (error) {
        console.error("Restore failed:", error);
        toast.error("復元中にエラーが発生しました");
      }
    });
  };

  // ファイルサイズをフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>データバックアップ</CardTitle>
          <CardDescription>
            登録したデータを安全にバックアップし、必要に応じて復元できます。
            バックアップはクラウドに保存されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* バックアップ作成ボタン */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">新しいバックアップを作成</h3>
              <p className="text-sm text-muted-foreground">
                現在のすべてのツールとプロンプト履歴をバックアップ
              </p>
            </div>
            <Button
              onClick={handleCreateBackup}
              disabled={isPending || isLoading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isPending ? "作成中..." : "バックアップ作成"}
            </Button>
          </div>

          {/* バックアップ一覧 */}
          <div className="space-y-4">
            <h3 className="font-semibold">バックアップ履歴</h3>

            {isLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                読み込み中...
              </div>
            ) : backups.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                バックアップがありません
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(backup.created_at).toLocaleString("ja-JP")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ツール {backup.tool_count}件 | プロンプト{" "}
                        {backup.prompt_count}件 | サイズ{" "}
                        {formatFileSize(backup.file_size)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRestoreDialog(backup)}
                      disabled={isPending}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      復元
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 復元確認ダイアログ */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>バックアップを復元しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このバックアップに含まれるデータを復元します。
              {selectedBackup && (
                <>
                  <br />
                  <br />
                  <strong>作成日時:</strong>{" "}
                  {new Date(selectedBackup.created_at).toLocaleString("ja-JP")}
                  <br />
                  <strong>ツール数:</strong> {selectedBackup.tool_count}件
                  <br />
                  <strong>プロンプト数:</strong> {selectedBackup.prompt_count}件
                  <br />
                  <br />
                  ※ 既存データに追加される形で復元されます（上書きではありません）
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>復元する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
