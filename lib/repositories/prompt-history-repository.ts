import { createClient } from "@/lib/supabase/server";
import type {
  PromptHistory,
  CreatePromptHistoryInput,
} from "@/lib/schemas/prompt.schema";

/**
 * プロンプト履歴リポジトリ
 */
class PromptHistoryRepository {
  /**
   * プロンプト履歴を作成
   */
  async create(
    input: CreatePromptHistoryInput
  ): Promise<PromptHistory | null> {
    const supabase = await createClient();

    console.log("[DEBUG] Creating prompt history with user_id:", input.user_id);
    console.log("[DEBUG] Input data:", input);

    const { data, error } = await (supabase as any)
      .from("prompt_history")
      .insert([
        {
          generated_prompt: input.generated_prompt,
          input_params: input.input_params,
          user_id: input.user_id,
          output_language: input.output_language || "ja",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Failed to create prompt history - Error details:", {
        error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        userId: input.user_id,
        inputData: input
      });
      return null;
    }

    console.log("[DEBUG] Prompt history created successfully:", data?.id);
    return data;
  }

  /**
   * IDでプロンプト履歴を取得
   */
  async findById(id: string): Promise<PromptHistory | null> {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("prompt_history")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      console.error("Failed to find prompt history:", error);
      return null;
    }

    return data;
  }

  /**
   * ユーザーIDでプロンプト履歴を取得（ページネーション対応）
   */
  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: "created_at" | "updated_at";
      order?: "asc" | "desc";
    }
  ): Promise<PromptHistory[]> {
    const supabase = await createClient();
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const orderBy = options?.orderBy || "created_at";
    const order = options?.order || "desc";

    const { data, error } = await (supabase as any)
      .from("prompt_history")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order(orderBy, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Failed to find prompt histories:", error);
      return [];
    }

    return data || [];
  }

  /**
   * 全てのプロンプト履歴を取得（ページネーション対応）
   */
  async findAll(options?: {
    limit?: number;
    offset?: number;
    orderBy?: "created_at" | "updated_at";
    order?: "asc" | "desc";
    userId?: string;
  }): Promise<PromptHistory[]> {
    const supabase = await createClient();
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const orderBy = options?.orderBy || "created_at";
    const order = options?.order || "desc";

    let query = (supabase as any)
      .from("prompt_history")
      .select("*")
      .is("deleted_at", null);

    // userIdが指定されている場合のみフィルタリング
    if (options?.userId) {
      query = query.eq("user_id", options.userId);
    }

    const { data, error } = await query
      .order(orderBy, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Failed to find all prompt histories:", error);
      return [];
    }

    return data || [];
  }

  /**
   * キーワード検索（全文検索）
   */
  async search(
    keyword: string,
    options?: {
      userId?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<PromptHistory[]> {
    const supabase = await createClient();
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    let query = (supabase as any)
      .from("prompt_history")
      .select("*")
      .is("deleted_at", null);

    // プロンプトテキストでの検索（大文字小文字を区別しない）
    query = query.ilike("prompt_text", `%${keyword}%`);

    // ユーザーIDでフィルタリング（オプション）
    if (options?.userId) {
      query = query.eq("user_id", options.userId);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Failed to search prompt histories:", error);
      return [];
    }

    return data || [];
  }

  /**
   * プロンプト履歴を削除（論理削除）
   */
  async delete(id: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await (supabase as any)
      .from("prompt_history")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Failed to delete prompt history:", error);
      return false;
    }

    return true;
  }

  /**
   * ユーザーのプロンプト履歴数を取得
   */
  async countByUserId(userId: string): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await (supabase as any)
      .from("prompt_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (error) {
      console.error("Failed to count prompt histories:", error);
      return 0;
    }

    return count || 0;
  }

  /**
   * 全てのプロンプト履歴数を取得
   */
  async countAll(): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await (supabase as any)
      .from("prompt_history")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    if (error) {
      console.error("Failed to count all prompt histories:", error);
      return 0;
    }

    return count || 0;
  }
}

/**
 * プロンプト履歴リポジトリのシングルトンインスタンス
 */
export const promptHistoryRepository = new PromptHistoryRepository();
