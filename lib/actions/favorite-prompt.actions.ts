/**
 * お気に入りプロンプトServer Actions
 * Requirement 13.7-13.8: お気に入りプロンプト管理機能
 */

"use server";

import { revalidatePath } from "next/cache";
import { FavoritePromptRepository } from "@/lib/repositories/favorite-prompt.repository";
import type {
  FavoritePrompt,
  FavoritePromptWithHistory,
} from "@/lib/types/favorite-prompt.types";
import type { Result } from "@/lib/types/result";

const repository = new FavoritePromptRepository();

/**
 * お気に入りプロンプトを追加する
 * @param userId ユーザーID
 * @param promptHistoryId プロンプト履歴ID
 * @returns お気に入りプロンプト
 */
export async function addFavoritePromptAction(
  userId: string,
  promptHistoryId: string,
): Promise<Result<FavoritePrompt>> {
  try {
    const result = await repository.add({
      user_id: userId,
      prompt_history_id: promptHistoryId,
    });

    if (!result.success) {
      return result;
    }

    // キャッシュを無効化
    revalidatePath("/profile");
    revalidatePath("/prompt/history");

    return result;
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * お気に入りプロンプトを削除する
 * @param userId ユーザーID
 * @param promptHistoryId プロンプト履歴ID
 * @returns 成功結果
 */
export async function removeFavoritePromptAction(
  userId: string,
  promptHistoryId: string,
): Promise<Result<void>> {
  try {
    const result = await repository.remove(userId, promptHistoryId);

    if (!result.success) {
      return result;
    }

    // キャッシュを無効化
    revalidatePath("/profile");
    revalidatePath("/prompt/history");

    return result;
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * ユーザーのお気に入りプロンプト一覧を取得する
 * @param userId ユーザーID
 * @returns お気に入りプロンプトリスト
 */
export async function getFavoritePromptsAction(
  userId: string,
): Promise<Result<FavoritePromptWithHistory[]>> {
  try {
    return await repository.findByUserId(userId);
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * プロンプトがお気に入りに追加されているかチェックする
 * @param userId ユーザーID
 * @param promptHistoryId プロンプト履歴ID
 * @returns お気に入りに追加済みの場合true
 */
export async function isFavoritedPromptAction(
  userId: string,
  promptHistoryId: string,
): Promise<Result<boolean>> {
  try {
    return await repository.isFavorited(userId, promptHistoryId);
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

/**
 * ユーザーのお気に入りプロンプト数を取得する
 * @param userId ユーザーID
 * @returns お気に入りプロンプト数
 */
export async function getFavoritePromptsCountAction(
  userId: string,
): Promise<Result<number>> {
  try {
    return await repository.countByUserId(userId);
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
