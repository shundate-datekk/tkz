"use client";

import { useState } from "react";
import { Copy, Check, Save, RefreshCw, Sparkles, Wand2, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

interface PromptResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  onSave: () => Promise<void>;
  onRegenerate: () => Promise<void>;
  onGenerateVariations: () => Promise<void>;
  onGenerateImprovements: () => Promise<void>;
  isSaving: boolean;
  isRegenerating: boolean;
  isGeneratingVariations: boolean;
  isGeneratingImprovements: boolean;
  isSaved: boolean;
}

export function PromptResultDialog({
  open,
  onOpenChange,
  prompt,
  onSave,
  onRegenerate,
  onGenerateVariations,
  onGenerateImprovements,
  isSaving,
  isRegenerating,
  isGeneratingVariations,
  isGeneratingImprovements,
  isSaved,
}: PromptResultDialogProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            生成完了！
          </DialogTitle>
          <DialogDescription>
            プロンプトが生成されました。コピーしてSora2で使用するか、履歴に保存できます。
          </DialogDescription>
        </DialogHeader>

        {/* プロンプト表示エリア（スクロール可能） */}
        <div className="flex-1 overflow-y-auto">
          <div className="rounded-lg bg-muted p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {prompt}
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col gap-3 pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={handleCopy}
              size="lg"
            >
              {isCopied ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  コピー済み
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-5 w-5" />
                  コピー
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onSave}
              disabled={isSaving || isSaved}
              size="lg"
            >
              {isSaved ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  保存済み
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  {isSaving ? "保存中..." : "履歴に保存"}
                </>
              )}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="secondary"
              onClick={onRegenerate}
              disabled={isRegenerating}
              size="lg"
            >
              <RefreshCw className={`mr-2 h-5 w-5 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? "再生成中..." : "再生成"}
            </Button>
            <Button
              variant="secondary"
              onClick={onGenerateVariations}
              disabled={isGeneratingVariations}
              size="lg"
            >
              <Wand2 className={`mr-2 h-5 w-5 ${isGeneratingVariations ? 'animate-pulse' : ''}`} />
              {isGeneratingVariations ? "生成中..." : "バリエーション"}
            </Button>
            <Button
              variant="secondary"
              onClick={onGenerateImprovements}
              disabled={isGeneratingImprovements}
              size="lg"
              className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/30 border-amber-200 dark:border-amber-800"
            >
              <Lightbulb className={`mr-2 h-5 w-5 text-amber-600 dark:text-amber-400 ${isGeneratingImprovements ? 'animate-pulse' : ''}`} />
              {isGeneratingImprovements ? "分析中..." : "AI改善提案"}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          💡 Sora2でこのプロンプトを使用して動画を生成できます
        </p>
      </DialogContent>
    </Dialog>
  );
}
