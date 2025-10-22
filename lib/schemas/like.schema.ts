import { z } from "zod";

/**
 * いいねスキーマ
 */
export const likeSchema = z.object({
  id: z.string().uuid(),
  tool_id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
});

export type Like = z.infer<typeof likeSchema>;

/**
 * いいね作成スキーマ
 */
export const createLikeSchema = z.object({
  tool_id: z.string().uuid(),
});

export type CreateLike = z.infer<typeof createLikeSchema>;

/**
 * ツールのいいね数
 */
export const toolLikeCountSchema = z.object({
  tool_id: z.string().uuid(),
  like_count: z.number().int().min(0),
  user_has_liked: z.boolean(),
});

export type ToolLikeCount = z.infer<typeof toolLikeCountSchema>;
