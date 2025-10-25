"use client";

import { useState } from "react";
import { Copy, Check, Save, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";

interface PromptVariation {
  promptText: string;
  inputParameters: any;
}

interface PromptVariationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variations: PromptVariation[];
  onSave: (promptText: string) => Promise<void>;
  isSaving: boolean;
}

export function PromptVariationsDialog({
  open,
  onOpenChange,
  variations,
  onSave,
  isSaving,
}: PromptVariationsDialogProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());

  async function handleCopy(promptText: string, index: number) {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedIndex(index);
      toast.success("プロンプトをコピーしました！");

      // 3秒後にコピー状態をリセット
      setTimeout(() => {
        setCopiedIndex(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
      toast.error("コピーに失敗しました");
    }
  }

  async function handleSave(promptText: string, index: number) {
    try {
      await onSave(promptText);
      setSavedIndices(prev => new Set(prev).add(index));
    } catch (error) {
      console.error("Failed to save prompt:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            バリエーション生成完了！
          </DialogTitle>
          <DialogDescription>
            {variations.length}つのバリエーションを生成しました。お好きなものを選んでコピーまたは保存できます。
          </DialogDescription>
        </DialogHeader>

        {/* バリエーション表示エリア（スクロール可能） */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-4">
            {variations.map((variation, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge variant="secondary">バリエーション {index + 1}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {variation.promptText}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCopy(variation.promptText, index)}
                    >
                      {copiedIndex === index ? (
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSave(variation.promptText, index)}
                      disabled={isSaving || savedIndices.has(index)}
                    >
                      {savedIndices.has(index) ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          保存済み
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving ? "保存中..." : "履歴に保存"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          💡 それぞれのバリエーションはSora2で異なる視点やアプローチを提供します
        </p>
      </DialogContent>
    </Dialog>
  );
}
