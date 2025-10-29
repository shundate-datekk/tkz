/**
 * お気に入りプロンプト機能の型定義
 * Requirement 13.7-13.8: お気に入りプロンプト管理機能
 */

import type { PromptHistory } from "@/lib/schemas/prompt.schema";

/**
 * お気に入りプロンプト
 */
export type FavoritePrompt = {
  id: string;
  user_id: string;
  prompt_history_id: string;
  created_at: string;
};

/**
 * プロンプト履歴情報を含むお気に入りプロンプト
 */
export type FavoritePromptWithHistory = FavoritePrompt & {
  prompt_history: PromptHistory;
};

/**
 * お気に入りプロンプト追加入力
 */
export type AddFavoritePromptInput = {
  user_id: string;
  prompt_history_id: string;
};
