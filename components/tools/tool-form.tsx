"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  createAiToolSchema,
  type CreateAIToolInput,
  TOOL_CATEGORIES,
} from "@/lib/schemas/ai-tool.schema";

interface ToolFormProps {
  onSubmit: (data: CreateAIToolInput) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateAIToolInput>;
  submitButtonText?: string;
  loadingText?: string;
}

export function ToolForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitButtonText = "登録",
  loadingText = "登録中...",
}: ToolFormProps) {
  const form = useForm<CreateAIToolInput>({
    resolver: zodResolver(createAiToolSchema),
    mode: "onBlur", // フォーカス離脱時にバリデーション
    defaultValues: defaultValues || {
      tool_name: "",
      category: "",
      usage_purpose: "",
      user_experience: "",
      rating: 3,
      usage_date: new Date().toISOString().split("T")[0],
    },
  });

  // 外部のisLoadingと内部のisSubmittingの両方を考慮
  const isFormDisabled = isLoading || form.formState.isSubmitting;

  // エラー時に最初のエラーフィールドにフォーカス&スクロール
  const handleFormError = () => {
    const firstError = Object.keys(form.formState.errors)[0];
    if (firstError) {
      form.setFocus(firstError as keyof CreateAIToolInput);

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
        {/* ツール名 */}
        <FormField
          control={form.control}
          name="tool_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ツール名 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="ChatGPT, Midjourney, GitHub Copilot など"
                  {...field}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormDescription>
                使用したAIツールの名前を入力してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* カテゴリ */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カテゴリ *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isFormDisabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択してください" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TOOL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                ツールのカテゴリを選択してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 使用目的 */}
        <FormField
          control={form.control}
          name="usage_purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>使用目的 *</FormLabel>
              <FormControl>
                <TextareaWithCounter
                  placeholder="例: ブログ記事の下書き作成、プログラミングの補助、画像生成など"
                  className="min-h-[100px]"
                  maxLength={2000}
                  {...field}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormDescription>
                このツールをどのような目的で使用しましたか？
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 使用感 */}
        <FormField
          control={form.control}
          name="user_experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>使用感 *</FormLabel>
              <FormControl>
                <TextareaWithCounter
                  placeholder="例: 操作が簡単で初心者でも使いやすい、出力品質が高い、レスポンスが速いなど"
                  className="min-h-[100px]"
                  maxLength={2000}
                  {...field}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormDescription>
                実際に使ってみた感想を教えてください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 評価 */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>評価 *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                defaultValue={String(field.value)}
                disabled={isFormDisabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="評価を選択してください" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5 - 非常に良い)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (4 - 良い)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (3 - 普通)</SelectItem>
                  <SelectItem value="2">⭐⭐ (2 - 悪い)</SelectItem>
                  <SelectItem value="1">⭐ (1 - 非常に悪い)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                ツールの総合評価を1〜5で選択してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 使用日時 */}
        <FormField
          control={form.control}
          name="usage_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>使用日 *</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isFormDisabled} />
              </FormControl>
              <FormDescription>
                このツールを使用した日付を選択してください
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
