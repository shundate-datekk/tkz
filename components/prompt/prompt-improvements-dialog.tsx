"use client";

import { Lightbulb, X, Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/lib/toast";

interface ImprovementSuggestion {
  category: string;
  suggestion: string;
  reason: string;
}

interface PromptImprovementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalPrompt: string;
  improvedPrompt: string;
  suggestions: ImprovementSuggestion[];
  onApply: (improvedPrompt: string) => void;
}

export function PromptImprovementsDialog({
  open,
  onOpenChange,
  originalPrompt,
  improvedPrompt,
  suggestions,
  onApply,
}: PromptImprovementsDialogProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(improvedPrompt);
      setIsCopied(true);
      toast.success("改善版プロンプトをコピーしました！");

      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to copy improved prompt:", error);
      toast.error("コピーに失敗しました");
    }
  }

  function handleApply() {
    onApply(improvedPrompt);
    onOpenChange(false);
    toast.success("改善版プロンプトを適用しました");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            AI改善提案
          </DialogTitle>
          <DialogDescription>
            現在のプロンプトを分析し、より効果的なプロンプトを提案します
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* 改善提案サマリー */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">改善提案</h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          {suggestion.category}
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          {suggestion.suggestion}
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          理由: {suggestion.reason}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* オリジナルプロンプト */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">元のプロンプト</h3>
              <div className="rounded-lg bg-muted p-4 border">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {originalPrompt}
                </p>
              </div>
            </div>

            {/* 改善版プロンプト */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">改善版プロンプト</h3>
              <div className="rounded-lg bg-primary/5 p-4 border-2 border-primary/20">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {improvedPrompt}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* アクションボタン */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="default"
            className="flex-1"
            onClick={handleApply}
            size="lg"
          >
            <Check className="mr-2 h-5 w-5" />
            この改善版を使用
          </Button>
          <Button
            variant="outline"
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
            variant="ghost"
            onClick={() => onOpenChange(false)}
            size="lg"
          >
            <X className="mr-2 h-5 w-5" />
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
