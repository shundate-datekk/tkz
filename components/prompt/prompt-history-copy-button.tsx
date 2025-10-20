"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PromptHistoryCopyButtonProps {
  promptText: string;
}

export function PromptHistoryCopyButton({
  promptText,
}: PromptHistoryCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(promptText);
      setIsCopied(true);
      toast.success("プロンプトをコピーしました！");

      // 3秒後にコピー状態をリセット
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
      toast.error("コピーに失敗しました");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {isCopied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          コピー済み
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          コピー
        </>
      )}
    </Button>
  );
}
