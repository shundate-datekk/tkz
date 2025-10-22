"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { deleteToolAction } from "@/lib/actions/ai-tool.actions";
import { Trash2 } from "lucide-react";

interface ToolDeleteButtonProps {
  toolId: string;
  toolName: string;
  category?: string;
  isOwner?: boolean;
}

/**
 * ツール削除ボタン
 * 詳細な確認ダイアログとUndo機能付きToast通知
 */
export function ToolDeleteButton({ 
  toolId, 
  toolName, 
  category,
  isOwner = true 
}: ToolDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      try {
        const result = await deleteToolAction(toolId);

        if (!result.success) {
          toast.error("削除に失敗しました", {
            description: result.error,
          });
          setShowConfirm(false);
          return;
        }

        // Undo機能付きToast通知（10秒間表示）
        toast.success("ツールを削除しました", {
          description: `「${toolName}」を削除しました`,
          duration: 10000,
          action: {
            label: "元に戻す",
            onClick: async () => {
              // TODO: 論理削除の復元機能を実装
              toast.info("元に戻す機能は今後実装予定です");
            },
          },
        });

        setShowConfirm(false);
        router.push("/tools");
        router.refresh();
      } catch (error) {
        console.error("Failed to delete tool:", error);
        toast.error("ツールの削除中にエラーが発生しました");
        setShowConfirm(false);
      }
    });
  }

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        削除
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ツールの削除</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>このツールを削除してもよろしいですか？</p>
                
                {/* 削除対象のプレビュー */}
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-foreground">ツール名:</span>
                    <p className="mt-1 text-sm text-foreground">{toolName}</p>
                  </div>
                  {category && (
                    <div>
                      <span className="text-sm font-medium text-foreground">カテゴリー:</span>
                      <p className="mt-1 text-sm text-foreground">{category}</p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  この操作は取り消すことができません。
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "削除中..." : "削除する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
