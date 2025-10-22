"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles, Copy, RefreshCw, Check, Save } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptForm } from "@/components/prompt/prompt-form";
import { generatePromptAction, regeneratePromptAction, savePromptHistoryAction } from "@/lib/actions/prompt.actions";
import type { GeneratePromptInput } from "@/lib/schemas/prompt.schema";

export function PromptGenerator() {
  const [isPending, startTransition] = useTransition();
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<GeneratePromptInput | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  async function handleSubmit(data: GeneratePromptInput) {
    startTransition(async () => {
      try {
        // 生成開始時にプロンプトをクリア
        setGeneratedPrompt(null);
        setIsCopied(false);
        setIsSaved(false);

        const loadingToast = toast.loading("プロンプトを生成中...");

        const result = await generatePromptAction(data);

        toast.dismiss(loadingToast);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success("プロンプトを生成しました！");

        // 生成されたプロンプトと入力パラメータを保存
        setGeneratedPrompt(result.data.promptText);
        setLastInput(data);
      } catch (error) {
        console.error("Failed to generate prompt:", error);
        toast.error("プロンプトの生成中にエラーが発生しました");
      }
    });
  }

  async function handleRegenerate() {
    if (!lastInput) return;

    startTransition(async () => {
      try {
        setIsCopied(false);
        setIsSaved(false);

        const loadingToast = toast.loading("プロンプトを再生成中...");

        const result = await regeneratePromptAction(lastInput);

        toast.dismiss(loadingToast);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success("新しいバリエーションを生成しました！");

        // 再生成されたプロンプトを保存
        setGeneratedPrompt(result.data.promptText);
      } catch (error) {
        console.error("Failed to regenerate prompt:", error);
        toast.error("プロンプトの再生成中にエラーが発生しました");
      }
    });
  }

  async function handleSave() {
    if (!generatedPrompt || !lastInput) return;

    startTransition(async () => {
      try {
        const loadingToast = toast.loading("プロンプトを保存中...");

        const result = await savePromptHistoryAction(generatedPrompt, lastInput);

        toast.dismiss(loadingToast);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success("プロンプトを履歴に保存しました！");
        setIsSaved(true);
      } catch (error) {
        console.error("Failed to save prompt:", error);
        toast.error("プロンプトの保存中にエラーが発生しました");
      }
    });
  }

  async function handleCopy() {
    if (!generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(generatedPrompt);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>プロンプト生成</CardTitle>
        </CardHeader>
        <CardContent>
          <PromptForm
            onSubmit={handleSubmit}
            isLoading={isPending}
            defaultValues={lastInput || undefined}
          />
        </CardContent>
      </Card>

      {/* ローディング表示 */}
      {isPending && !generatedPrompt && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg font-medium">プロンプトを生成中...</p>
              <p className="mt-2 text-sm text-muted-foreground">
                AIがあなたの要望を分析しています
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 生成完了時の表示 */}
      {generatedPrompt && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>生成されたプロンプト</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={isPending}
                >
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isPending || isSaved}
                >
                  {isSaved ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      保存済み
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      保存
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isPending}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                  再生成
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {generatedPrompt}
              </p>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              ※ このプロンプトをSora2にコピー＆ペーストして使用してください
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
