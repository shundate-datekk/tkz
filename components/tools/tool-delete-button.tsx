"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteToolAction } from "@/lib/actions/ai-tool.actions";

interface ToolDeleteButtonProps {
  toolId: string;
  toolName: string;
  isOwner?: boolean;
}

export function ToolDeleteButton({ toolId, toolName, isOwner = true }: ToolDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOwnerConfirm, setShowOwnerConfirm] = useState(false);

  function handleDelete() {
    // 他ユーザーのツールの場合は追加の確認ダイアログを表示
    if (!isOwner && !showOwnerConfirm) {
      setShowOwnerConfirm(true);
      return;
    }

    // 通常の確認ダイアログを表示
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    executeDelete();
  }

  function executeDelete() {
    startTransition(async () => {
      try {
        const loadingToast = toast.loading("ツールを削除中...");

        const result = await deleteToolAction(toolId);

        toast.dismiss(loadingToast);

        if (!result.success) {
          toast.error(result.error);
          setShowConfirm(false);
          setShowOwnerConfirm(false);
          return;
        }

        toast.success("ツールを削除しました");
        router.push("/tools");
        router.refresh();
      } catch (error) {
        console.error("Failed to delete tool:", error);
        toast.error("ツールの削除中にエラーが発生しました");
        setShowConfirm(false);
        setShowOwnerConfirm(false);
      }
    });
  }

  function handleOwnerConfirm() {
    setShowOwnerConfirm(false);
    setShowConfirm(true);
  }

  function handleCancel() {
    setShowConfirm(false);
    setShowOwnerConfirm(false);
  }

  return (
    <>
      {!showConfirm ? (
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          削除
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "削除中..." : "本当に削除"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            キャンセル
          </Button>
        </div>
      )}

      {/* 他ユーザーのツール削除時の確認ダイアログ */}
      <ConfirmDialog
        open={showOwnerConfirm}
        onOpenChange={setShowOwnerConfirm}
        onConfirm={handleOwnerConfirm}
        title="他のユーザーのツールを削除"
        description={`このツール「${toolName}」は他のユーザーが作成したものです。本当に削除してもよろしいですか？`}
        confirmText="次へ"
        cancelText="キャンセル"
        variant="destructive"
      />
    </>
  );
}
