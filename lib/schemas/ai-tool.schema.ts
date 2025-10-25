import { z } from "zod";

/**
 * AIツールのZodスキーマ
 */
export const aiToolSchema = z.object({
  tool_name: z
    .string()
    .min(1, "ツール名を入力してください")
    .max(200, "ツール名は200文字以内で入力してください"),
  category: z
    .string()
    .min(1, "カテゴリを選択してください")
    .max(100, "カテゴリは100文字以内で入力してください"),
  usage_purpose: z
    .string()
    .min(1, "使用目的を入力してください")
    .max(2000, "使用目的は2000文字以内で入力してください"),
  user_experience: z
    .string()
    .min(1, "使用感を入力してください")
    .max(2000, "使用感は2000文字以内で入力してください"),
  rating: z
    .number()
    .int("評価は整数で入力してください")
    .min(1, "評価は1以上で入力してください")
    .max(5, "評価は5以下で入力してください"),
  usage_date: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "有効な日付を入力してください" }
  ),
  tags: z.array(z.string()).optional(),
});

/**
 * AIツール作成用のスキーマ
 */
export const createAiToolSchema = aiToolSchema;

/**
 * AIツール更新用のスキーマ（すべてのフィールドをオプショナルに）
 */
export const updateAiToolSchema = aiToolSchema.partial();

/**
 * AIツールの型定義
 */
export interface AITool {
  id: string;
  tool_name: string;
  category: string;
  usage_purpose: string;
  user_experience: string;
  rating: number;
  usage_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  tags?: string[]; // タグ名の配列（オプショナル）
}

/**
 * AIツール作成用の入力型
 */
export type CreateAIToolInput = z.infer<typeof createAiToolSchema>;

/**
 * AIツール更新用の入力型
 */
export type UpdateAIToolInput = z.infer<typeof updateAiToolSchema>;

/**
 * AIツール検索フィルター
 */
export interface AIToolFilter {
  category?: string;
  rating?: number;
  created_by?: string;
  search?: string;
}

/**
 * AIツールソートオプション
 */
export type AIToolSortBy = "usage_date" | "rating" | "created_at";
export type SortOrder = "asc" | "desc";

/**
 * 一般的なカテゴリリスト
 */
export const TOOL_CATEGORIES = [
  "テキスト生成",
  "画像生成",
  "動画生成",
  "音声生成",
  "コード生成",
  "翻訳",
  "要約",
  "チャットボット",
  "データ分析",
  "その他",
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];
