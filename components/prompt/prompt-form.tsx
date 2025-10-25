"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  generatePromptSchema,
  type GeneratePromptInput,
  VIDEO_DURATIONS,
  VIDEO_STYLES,
} from "@/lib/schemas/prompt.schema";
import { PROMPT_TEMPLATES, getTemplateById } from "@/lib/constants/prompt-templates";

interface PromptFormProps {
  onSubmit: (data: GeneratePromptInput) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<GeneratePromptInput>;
  submitButtonText?: string;
  loadingText?: string;
}

export function PromptForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitButtonText = "プロンプトを生成",
  loadingText = "生成中...",
}: PromptFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const form = useForm<GeneratePromptInput>({
    resolver: zodResolver(generatePromptSchema),
    mode: "onBlur", // フォーカス離脱時にバリデーション
    defaultValues: {
      purpose: "",
      sceneDescription: "",
      style: "",
      duration: "",
      additionalRequirements: "",
      outputLanguage: "ja",
      ...defaultValues,
    },
  });

  // 外部のisLoadingと内部のisSubmittingの両方を考慮
  const isFormDisabled = isLoading || form.formState.isSubmitting;

  // テンプレート選択時の処理
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);

    if (!templateId) return;

    const template = getTemplateById(templateId);
    if (!template) return;

    // テンプレートのデフォルト値でフォームを更新
    const { defaultValues: templateDefaults } = template;
    if (templateDefaults.sceneDescription) {
      form.setValue("sceneDescription", templateDefaults.sceneDescription);
    }
    if (templateDefaults.style) {
      form.setValue("style", templateDefaults.style);
    }
    if (templateDefaults.duration) {
      form.setValue("duration", templateDefaults.duration);
    }
    if (templateDefaults.additionalRequirements) {
      form.setValue("additionalRequirements", templateDefaults.additionalRequirements);
    }
  };

  // エラー時に最初のエラーフィールドにフォーカス&スクロール
  const handleFormError = () => {
    const firstError = Object.keys(form.formState.errors)[0];
    if (firstError) {
      form.setFocus(firstError as keyof GeneratePromptInput);

      // エラーフィールドまでスクロール
      setTimeout(() => {
        const errorElement = document.querySelector(`[name="${firstError}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, handleFormError)} className="space-y-6">
        {/* テンプレート選択 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">テンプレート（任意）</label>
          <Select
            value={selectedTemplate}
            onValueChange={handleTemplateSelect}
            disabled={isFormDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="テンプレートを選択してフォームを自動入力" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">テンプレートなし</SelectItem>
              {PROMPT_TEMPLATES.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>{template.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplate && (
            <p className="text-xs text-muted-foreground">
              {PROMPT_TEMPLATES.find((t) => t.id === selectedTemplate)?.description}
            </p>
          )}
        </div>

        {/* プロンプトの言語 */}
        <FormField
          control={form.control}
          name="outputLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>プロンプトの言語 *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormDisabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="言語を選択してください" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                生成されるプロンプトの言語を選択してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 目的 */}
        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>目的 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="例: 商品プロモーション、SNS投稿、教育コンテンツなど"
                  {...field}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormDescription>
                この動画を作成する目的を入力してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* シーン説明 */}
        <FormField
          control={form.control}
          name="sceneDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>シーン説明 *</FormLabel>
              <FormControl>
                <TextareaWithCounter
                  placeholder="例: 夕暮れの海辺で、波が穏やかに打ち寄せる様子。遠くに小さな灯台が見える。カメラはゆっくりと左から右へパン。"
                  className="min-h-[120px]"
                  maxLength={1000}
                  {...field}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormDescription>
                撮影したいシーンを具体的に説明してください（カメラアングル、照明、動きなど）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* スタイル */}
        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>スタイル（任意）</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormDisabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="スタイルを選択してください" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VIDEO_STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                動画の映像スタイルを選択してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 長さ */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>長さ（任意）</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormDisabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="動画の長さを選択してください" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VIDEO_DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                希望する動画の長さを選択してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* その他の要望 */}
        <FormField
          control={form.control}
          name="additionalRequirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>その他の要望（任意）</FormLabel>
              <FormControl>
                <TextareaWithCounter
                  placeholder="例: 明るい雰囲気で、音楽に合わせてリズミカルな編集を希望。色彩は暖色系で統一してほしい。"
                  className="min-h-[100px]"
                  maxLength={500}
                  {...field}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormDescription>
                その他の要望や細かい指定があれば入力してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" isLoading={isFormDisabled} disabled={isFormDisabled}>
          {isFormDisabled ? loadingText : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}
