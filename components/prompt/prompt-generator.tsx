"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptForm } from "@/components/prompt/prompt-form";
import { PromptResultDialog } from "@/components/prompt/prompt-result-dialog";
import { PromptVariationsDialog } from "@/components/prompt/prompt-variations-dialog";
import { generatePromptAction, regeneratePromptAction, generatePromptVariationsAction, savePromptHistoryAction } from "@/lib/actions/prompt.actions";
import type { GeneratePromptInput } from "@/lib/schemas/prompt.schema";

export function PromptGenerator() {
  const [isPending, startTransition] = useTransition();
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<GeneratePromptInput | null>(null);
  const [outputLanguage, setOutputLanguage] = useState<"ja" | "en">("ja");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [variations, setVariations] = useState<Array<{ promptText: string; inputParameters: any }>>([]);
  const [isVariationsDialogOpen, setIsVariationsDialogOpen] = useState(false);

  async function handleSubmit(data: GeneratePromptInput) {
    startTransition(async () => {
      try {
        // 生成開始時にプロンプトをクリア
        setGeneratedPrompt(null);
        setIsSaved(false);
        setIsDialogOpen(false);

        const loadingToast = toast.loading("プロンプトを生成中...");

        const result = await generatePromptAction(data);

        toast.dismiss(loadingToast);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        // 生成されたプロンプトと入力パラメータを保存
        setGeneratedPrompt(result.data.promptText);
        setLastInput(data);
        setOutputLanguage(data.outputLanguage || "ja");

        // モーダルを開く
        setIsDialogOpen(true);
        toast.success("プロンプトを生成しました！");
      } catch (error) {
        console.error("Failed to generate prompt:", error);
        toast.error("プロンプトの生成中にエラーが発生しました");
      }
    });
  }

  async function handleRegenerate() {
    if (!lastInput) return;

    setIsRegenerating(true);
    try {
      setIsSaved(false);

      const result = await regeneratePromptAction(lastInput);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // 再生成されたプロンプトを保存
      setGeneratedPrompt(result.data.promptText);
      toast.success("新しいバリエーションを生成しました！");
    } catch (error) {
      console.error("Failed to regenerate prompt:", error);
      toast.error("プロンプトの再生成中にエラーが発生しました");
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handleGenerateVariations() {
    if (!lastInput) return;

    setIsGeneratingVariations(true);
    try {
      const loadingToast = toast.loading("バリエーションを生成中...");

      const result = await generatePromptVariationsAction(lastInput, 3);

      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // バリエーションを保存
      setVariations(result.data.variations);
      
      // 単一プロンプトダイアログを閉じる
      setIsDialogOpen(false);
      
      // バリエーションダイアログを開く
      setIsVariationsDialogOpen(true);
      
      toast.success(`${result.data.variations.length}つのバリエーションを生成しました！`);
    } catch (error) {
      console.error("Failed to generate variations:", error);
      toast.error("バリエーションの生成中にエラーが発生しました");
    } finally {
      setIsGeneratingVariations(false);
    }
  }

  async function handleSave() {
    if (!generatedPrompt || !lastInput) return;

    setIsSaving(true);
    try {
      const result = await savePromptHistoryAction(generatedPrompt, lastInput, outputLanguage);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("プロンプトを履歴に保存しました！");
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to save prompt:", error);
      toast.error("プロンプトの保存中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveVariation(promptText: string) {
    if (!lastInput) return;

    setIsSaving(true);
    try {
      const result = await savePromptHistoryAction(promptText, lastInput, outputLanguage);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("プロンプトを履歴に保存しました！");
    } catch (error) {
      console.error("Failed to save prompt:", error);
      toast.error("プロンプトの保存中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
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
      </div>

      {/* プロンプト結果モーダル */}
      {generatedPrompt && (
        <PromptResultDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          prompt={generatedPrompt}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
          onGenerateVariations={handleGenerateVariations}
          isSaving={isSaving}
          isRegenerating={isRegenerating}
          isGeneratingVariations={isGeneratingVariations}
          isSaved={isSaved}
        />
      )}

      {/* バリエーションダイアログ */}
      {variations.length > 0 && (
        <PromptVariationsDialog
          open={isVariationsDialogOpen}
          onOpenChange={setIsVariationsDialogOpen}
          variations={variations}
          onSave={handleSaveVariation}
          isSaving={isSaving}
        />
      )}
    </>
  );
}
