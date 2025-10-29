/**
 * お気に入りプロンプトRepositoryクラス
 * Requirement 13.7-13.8: お気に入りプロンプト管理機能
 */

import { createClient } from "@/lib/supabase/server";
import type {
  FavoritePrompt,
  FavoritePromptWithHistory,
  AddFavoritePromptInput,
} from "@/lib/types/favorite-prompt.types";
import type { Result } from "@/lib/types/result";

export class FavoritePromptRepository {
  /**
   * お気に入りプロンプトを追加する
   * @param input お気に入りプロンプト追加入力
   * @returns お気に入りプロンプト
   */
  async add(
    input: AddFavoritePromptInput,
  ): Promise<Result<FavoritePrompt>> {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("favorite_prompts")
      .insert(input)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * お気に入りプロンプトを削除する
   * @param userId ユーザーID
   * @param promptHistoryId プロンプト履歴ID
   * @returns 成功結果
   */
  async remove(
    userId: string,
    promptHistoryId: string,
  ): Promise<Result<void>> {
    const supabase = await createClient();

    const { error } = await (supabase as any)
      .from("favorite_prompts")
      .delete()
      .eq("user_id", userId)
      .eq("prompt_history_id", promptHistoryId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  }

  /**
   * ユーザーIDでお気に入りプロンプトを取得する（プロンプト履歴情報を含む）
   * @param userId ユーザーID
   * @returns お気に入りプロンプトリスト
   */
  async findByUserId(
    userId: string,
  ): Promise<Result<FavoritePromptWithHistory[]>> {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("favorite_prompts")
      .select(`
        *,
        prompt_history (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  }

  /**
   * プロンプトがお気に入りに追加されているかチェックする
   * @param userId ユーザーID
   * @param promptHistoryId プロンプト履歴ID
   * @returns お気に入りに追加済みの場合true
   */
  async isFavorited(
    userId: string,
    promptHistoryId: string,
  ): Promise<Result<boolean>> {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from("favorite_prompts")
      .select("id")
      .eq("user_id", userId)
      .eq("prompt_history_id", promptHistoryId)
      .single();

    // Not found error (PGRST116) is expected when not favorited
    if (error && error.code === "PGRST116") {
      return { success: true, data: false };
    }

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: !!data };
  }

  /**
   * ユーザーのお気に入りプロンプト数をカウントする
   * @param userId ユーザーID
   * @returns お気に入りプロンプト数
   */
  async countByUserId(userId: string): Promise<Result<number>> {
    const supabase = await createClient();

    const { count, error } = await (supabase as any)
      .from("favorite_prompts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: count || 0 };
  }
}
