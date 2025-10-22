import { z } from "zod";

/**
 * タグスキーマ
 */
export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  created_at: z.string().datetime(),
  created_by: z.string().uuid(),
});

export type Tag = z.infer<typeof tagSchema>;

/**
 * タグ作成スキーマ
 */
export const createTagSchema = z.object({
  name: z.string()
    .min(1, "タグ名は必須です")
    .max(50, "タグ名は50文字以内で入力してください")
    .regex(/^[a-zA-Z0-9ぁ-んァ-ヶー一-龠々\-_]+$/, "タグ名は英数字、ひらがな、カタカナ、漢字、ハイフン、アンダースコアのみ使用できます"),
});

export type CreateTag = z.infer<typeof createTagSchema>;

/**
 * ツールタグ関連スキーマ
 */
export const toolTagSchema = z.object({
  id: z.string().uuid(),
  tool_id: z.string().uuid(),
  tag_id: z.string().uuid(),
  created_at: z.string().datetime(),
});

export type ToolTag = z.infer<typeof toolTagSchema>;

/**
 * タグ付きツール情報
 */
export const toolWithTagsSchema = z.object({
  tool_id: z.string().uuid(),
  tags: z.array(tagSchema),
});

export type ToolWithTags = z.infer<typeof toolWithTagsSchema>;
