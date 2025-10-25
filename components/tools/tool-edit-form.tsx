"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ToolForm } from "@/components/tools/tool-form";
import { updateToolAction } from "@/lib/actions/ai-tool.actions";
import type { AITool, CreateAIToolInput } from "@/lib/schemas/ai-tool.schema";

interface ToolEditFormProps {
  tool: AITool;
  isOwner: boolean;
}

export function ToolEditForm({ tool, isOwner }: ToolEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<CreateAIToolInput | null>(null);

  async function handleSubmit(data: CreateAIToolInput) {
    // 他ユーザーのツールの場合は確認ダイアログを表示
    if (!isOwner) {
      setPendingData(data);
      setShowConfirmDialog(true);
      return;
    }

    // 自分のツールの場合は直接更新
    executeUpdate(data);
  }

  function executeUpdate(data: CreateAIToolInput) {
    startTransition(async () => {
      try {
        const loadingToast = toast.loading("ツールを更新中...");

        const result = await updateToolAction(tool.id, data);

        toast.dismiss(loadingToast);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success("ツールを更新しました！");

        // 詳細ページにリダイレクト
        router.push(`/tools/${tool.id}`);
        router.refresh();
      } catch (error) {
        console.error("Failed to update tool:", error);
        toast.error("ツールの更新中にエラーが発生しました");
      }
    });
  }

  function handleConfirm() {
    setShowConfirmDialog(false);
    if (pendingData) {
      executeUpdate(pendingData);
      setPendingData(null);
    }
  }

  function handleCancel() {
    setShowConfirmDialog(false);
    setPendingData(null);
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/tools/${tool.id}`}>← 詳細に戻る</Link>
          </Button>
        </div>

        {/* 他ユーザーのツール編集時の警告 */}
        {!isOwner && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                    他のユーザーが作成したツールを編集しようとしています
                  </p>
                  <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                    更新する前に確認ダイアログが表示されます。本当に編集が必要か確認してください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>ツール情報</CardTitle>
          </CardHeader>
          <CardContent>
            <ToolForm
              onSubmit={handleSubmit}
              isLoading={isPending}
              defaultValues={{
                tool_name: tool.tool_name,
                category: tool.category,
                usage_purpose: tool.usage_purpose,
                user_experience: tool.user_experience,
                rating: tool.rating,
                usage_date: tool.usage_date,
                tags: tool.tags || [],
              }}
              submitButtonText="更新"
              loadingText="更新中..."
            />
          </CardContent>
        </Card>
      </div>

      {/* 他ユーザーのツール編集時の確認ダイアログ */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirm}
        title="他のユーザーのツールを編集"
        description="このツールは他のユーザーが作成したものです。本当に編集してもよろしいですか？"
        confirmText="編集する"
        cancelText="キャンセル"
        variant="default"
      />
    </>
  );
}
