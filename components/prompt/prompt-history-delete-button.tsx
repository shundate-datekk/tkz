"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deletePromptHistoryAction } from "@/lib/actions/prompt.actions";

interface PromptHistoryDeleteButtonProps {
  historyId: string;
  promptTitle?: string;
}

export function PromptHistoryDeleteButton({
  historyId,
  promptTitle,
}: PromptHistoryDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      try {
        const loadingToast = toast.loading("履歴を削除中...");

        const result = await deletePromptHistoryAction(historyId);

        toast.dismiss(loadingToast);

        if (!result.success) {
          toast.error(result.error);
          setShowConfirm(false);
          return;
        }

        toast.success("履歴を削除しました");
        router.push("/history");
        router.refresh();
      } catch (error) {
        console.error("Failed to delete history:", error);
        toast.error("削除中にエラーが発生しました");
        setShowConfirm(false);
      }
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        aria-label="履歴を削除"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        削除
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDelete}
        title="履歴を削除"
        description={
          promptTitle
            ? `「${promptTitle}」を削除してもよろしいですか？この操作は取り消せません。`
            : "この履歴を削除してもよろしいですか？この操作は取り消せません。"
        }
        confirmText="削除する"
        cancelText="キャンセル"
        variant="destructive"
      />
    </>
  );
}
