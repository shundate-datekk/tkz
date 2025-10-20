"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePromptHistoryAction } from "@/lib/actions/prompt.actions";

interface PromptHistoryDeleteButtonProps {
  historyId: string;
}

export function PromptHistoryDeleteButton({
  historyId,
}: PromptHistoryDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);

  function handleClick() {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    startTransition(async () => {
      try {
        toast.loading("削除中...", { id: "delete-history" });

        const result = await deletePromptHistoryAction(historyId);

        if (!result.success) {
          toast.error(result.error, { id: "delete-history" });
          return;
        }

        toast.success("履歴を削除しました", { id: "delete-history" });
        router.push("/history");
        router.refresh();
      } catch (error) {
        console.error("Failed to delete history:", error);
        toast.error("削除中にエラーが発生しました", { id: "delete-history" });
      }
    });
  }

  return (
    <Button
      variant={isConfirming ? "destructive" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isConfirming ? "本当に削除？" : "削除"}
    </Button>
  );
}
