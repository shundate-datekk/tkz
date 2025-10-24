import { z } from "zod";

/**
 * プロンプト生成入力のZodスキーマ
 */
export const generatePromptSchema = z.object({
  purpose: z
    .string()
    .min(1, "目的を入力してください")
    .max(500, "目的は500文字以内で入力してください"),
  sceneDescription: z
    .string()
    .min(1, "シーン説明を入力してください")
    .max(1000, "シーン説明は1000文字以内で入力してください"),
  style: z
    .string()
    .max(200, "スタイルは200文字以内で入力してください")
    .optional(),
  duration: z
    .string()
    .max(100, "長さは100文字以内で入力してください")
    .optional(),
  additionalRequirements: z
    .string()
    .max(500, "その他の要望は500文字以内で入力してください")
    .optional(),
  outputLanguage: z
    .enum(["ja", "en"], {
      errorMap: () => ({ message: "日本語または英語を選択してください" }),
    })
    .default("ja"),
});

/**
 * プロンプト生成入力の型定義
 */
export type GeneratePromptInput = z.infer<typeof generatePromptSchema>;

/**
 * プロンプト履歴のZodスキーマ
 */
export const promptHistorySchema = z.object({
  prompt_text: z.string().min(1, "プロンプトテキストは必須です"),
  input_parameters: z.record(z.string(), z.any()),
  created_by: z.string().uuid("無効なユーザーIDです"),
  output_language: z.enum(["ja", "en"]).optional().default("ja"),
});

/**
 * プロンプト履歴の型定義
 */
export interface PromptHistory {
  id: string;
  prompt_text: string;
  input_parameters: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  output_language: string;
}

/**
 * プロンプト履歴作成用の入力型
 */
export type CreatePromptHistoryInput = z.infer<typeof promptHistorySchema>;

/**
 * 動画の長さのオプション
 */
export const VIDEO_DURATIONS = [
  "5秒",
  "10秒",
  "15秒",
  "30秒",
  "1分",
  "その他",
] as const;

/**
 * 一般的なスタイルのオプション
 */
export const VIDEO_STYLES = [
  "リアル",
  "アニメーション",
  "3DCG",
  "イラスト",
  "ドキュメンタリー風",
  "映画風",
  "ミュージックビデオ風",
  "その他",
] as const;

export type VideoDuration = (typeof VIDEO_DURATIONS)[number];
export type VideoStyle = (typeof VIDEO_STYLES)[number];
