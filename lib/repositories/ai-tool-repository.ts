import { supabase } from "@/lib/supabase/client";
import type {
  AITool,
  CreateAIToolInput,
  UpdateAIToolInput,
  AIToolFilter,
  AIToolSortBy,
  SortOrder,
} from "@/lib/schemas/ai-tool.schema";

/**
 * AIツールリポジトリ
 * AIツール情報のCRUD操作を提供
 */
export class AIToolRepository {
  /**
   * AIツールを作成
   */
  async create(
    input: CreateAIToolInput,
    userId: string
  ): Promise<AITool | null> {
    const { data, error } = await supabase
      .from("ai_tools")
      .insert({
        tool_name: input.tool_name,
        category: input.category,
        usage_purpose: input.usage_purpose,
        user_experience: input.user_experience,
        rating: input.rating,
        usage_date: input.usage_date,
        created_by: userId,
      } as any)
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to create AI tool:", error);
      return null;
    }

    return data as any;
  }

  /**
   * IDでAIツールを取得
   */
  async findById(id: string): Promise<AITool | null> {
    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      return null;
    }

    return data as any;
  }

  /**
   * すべてのAIツールを取得（論理削除されていないもの）
   */
  async findAll(
    filter?: AIToolFilter,
    sortBy: AIToolSortBy = "usage_date",
    sortOrder: SortOrder = "desc"
  ): Promise<AITool[]> {
    let query = supabase
      .from("ai_tools")
      .select("*")
      .is("deleted_at", null);

    // フィルタ適用
    if (filter?.category) {
      query = query.eq("category", filter.category);
    }

    if (filter?.rating) {
      query = query.eq("rating", filter.rating);
    }

    if (filter?.created_by) {
      query = query.eq("created_by", filter.created_by);
    }

    if (filter?.search) {
      // 全文検索（ツール名、使用目的、使用感）
      query = query.or(
        `tool_name.ilike.%${filter.search}%,usage_purpose.ilike.%${filter.search}%,user_experience.ilike.%${filter.search}%`
      );
    }

    // ソート
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, error } = await query;

    if (error || !data) {
      console.error("Failed to fetch AI tools:", error);
      return [];
    }

    return data as any;
  }

  /**
   * ページネーション付きでAIツールを取得
   */
  async findWithPagination(
    page: number = 1,
    pageSize: number = 10,
    filter?: AIToolFilter,
    sortBy: AIToolSortBy = "usage_date",
    sortOrder: SortOrder = "desc"
  ): Promise<{ tools: AITool[]; total: number; totalPages: number }> {
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("ai_tools")
      .select("*", { count: "exact" })
      .is("deleted_at", null);

    // フィルタ適用
    if (filter?.category) {
      query = query.eq("category", filter.category);
    }

    if (filter?.rating) {
      query = query.eq("rating", filter.rating);
    }

    if (filter?.created_by) {
      query = query.eq("created_by", filter.created_by);
    }

    if (filter?.search) {
      query = query.or(
        `tool_name.ilike.%${filter.search}%,usage_purpose.ilike.%${filter.search}%,user_experience.ilike.%${filter.search}%`
      );
    }

    // ソートとページネーション
    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error || !data) {
      console.error("Failed to fetch AI tools with pagination:", error);
      return { tools: [], total: 0, totalPages: 0 };
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      tools: data as any,
      total,
      totalPages,
    };
  }

  /**
   * ユーザーが作成したAIツールを取得
   */
  async findByUserId(userId: string): Promise<AITool[]> {
    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("created_by", userId)
      .is("deleted_at", null)
      .order("usage_date", { ascending: false });

    if (error || !data) {
      console.error("Failed to fetch user's AI tools:", error);
      return [];
    }

    return data as any;
  }

  /**
   * AIツールを更新
   */
  async update(
    id: string,
    input: UpdateAIToolInput
  ): Promise<AITool | null> {
    const { data, error } = await (supabase as any)
      .from("ai_tools")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to update AI tool:", error);
      return null;
    }

    return data as any;
  }

  /**
   * AIツールを論理削除
   */
  async softDelete(id: string): Promise<boolean> {
    const { error } = await (supabase as any)
      .from("ai_tools")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) {
      console.error("Failed to soft delete AI tool:", error);
      return false;
    }

    return true;
  }

  /**
   * 論理削除されたツールを取得（30日以内）
   */
  async findDeletedTools(userId: string): Promise<AITool[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("created_by", userId)
      .not("deleted_at", "is", null)
      .gte("deleted_at", thirtyDaysAgo.toISOString())
      .order("deleted_at", { ascending: false });

    if (error || !data) {
      console.error("Failed to fetch deleted AI tools:", error);
      return [];
    }

    return data as any;
  }

  /**
   * 論理削除されたツールを復元
   */
  async restore(id: string, userId: string): Promise<AITool | null> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 30日以内に削除され、かつ所有者が一致するツールのみ復元可能
    const { data, error } = await (supabase as any)
      .from("ai_tools")
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("created_by", userId)
      .not("deleted_at", "is", null)
      .gte("deleted_at", thirtyDaysAgo.toISOString())
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to restore AI tool:", error);
      return null;
    }

    return data as any;
  }

  /**
   * 指定日数より古い論理削除されたツールを物理削除
   */
  async cleanupOldDeletedTools(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from("ai_tools")
      .delete()
      .not("deleted_at", "is", null)
      .lt("deleted_at", cutoffDate.toISOString())
      .select();

    if (error) {
      console.error("Failed to cleanup old deleted AI tools:", error);
      return 0;
    }

    return data?.length ?? 0;
  }

  /**
   * AIツールを物理削除（管理用）
   */
  async hardDelete(id: string): Promise<boolean> {
    const { error } = await supabase.from("ai_tools").delete().eq("id", id);

    if (error) {
      console.error("Failed to hard delete AI tool:", error);
      return false;
    }

    return true;
  }

  /**
   * カテゴリ別のツール数を取得
   */
  async countByCategory(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from("ai_tools")
      .select("category")
      .is("deleted_at", null);

    if (error || !data) {
      console.error("Failed to count by category:", error);
      return {};
    }

    const counts: Record<string, number> = {};
    for (const item of data) {
      const category = (item as any).category;
      counts[category] = (counts[category] || 0) + 1;
    }

    return counts;
  }

  /**
   * ユーザー別のツール数を取得
   */
  async countByUser(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from("ai_tools")
      .select("created_by")
      .is("deleted_at", null);

    if (error || !data) {
      console.error("Failed to count by user:", error);
      return {};
    }

    const counts: Record<string, number> = {};
    for (const item of data) {
      const userId = (item as any).created_by;
      counts[userId] = (counts[userId] || 0) + 1;
    }

    return counts;
  }
}

// シングルトンインスタンス
export const aiToolRepository = new AIToolRepository();
