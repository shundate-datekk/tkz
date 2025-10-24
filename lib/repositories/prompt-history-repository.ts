import { supabase } from "@/lib/supabase/client";
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

    const { data, error } = await (supabase as any)
      .from("prompt_history")
      .insert([
        {
          prompt_text: input.prompt_text,
          input_parameters: input.input_parameters,
          created_by: input.created_by,
          output_language: input.output_language || "ja",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Failed to create prompt history:", error);
      return null;
    }

    return data;
  }

  /**
   * IDでプロンプト履歴を取得
   */
  async findById(id: string): Promise<PromptHistory | null> {
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
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const orderBy = options?.orderBy || "created_at";
    const order = options?.order || "desc";

    const { data, error } = await (supabase as any)
      .from("prompt_history")
      .select("*")
      .eq("created_by", userId)
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
  }): Promise<PromptHistory[]> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const orderBy = options?.orderBy || "created_at";
    const order = options?.order || "desc";

    const { data, error } = await (supabase as any)
      .from("prompt_history")
      .select("*")
      .is("deleted_at", null)
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
      query = query.eq("created_by", options.userId);
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
    const { count, error } = await (supabase as any)
      .from("prompt_history")
      .select("*", { count: "exact", head: true })
      .eq("created_by", userId)
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
