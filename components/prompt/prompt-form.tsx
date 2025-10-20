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
import { Textarea } from "@/components/ui/textarea";
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
  const form = useForm<GeneratePromptInput>({
    resolver: zodResolver(generatePromptSchema),
    defaultValues: defaultValues || {
      purpose: "",
      sceneDescription: "",
      style: "",
      duration: "",
      additionalRequirements: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  disabled={isLoading}
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
                <Textarea
                  placeholder="例: 夕暮れの海辺で、波が穏やかに打ち寄せる様子。遠くに小さな灯台が見える。カメラはゆっくりと左から右へパン。"
                  className="min-h-[120px]"
                  {...field}
                  disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                <Textarea
                  placeholder="例: 明るい雰囲気で、音楽に合わせてリズミカルな編集を希望。色彩は暖色系で統一してほしい。"
                  className="min-h-[100px]"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                その他の要望や細かい指定があれば入力してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? loadingText : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}
