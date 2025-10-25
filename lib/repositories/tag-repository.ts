/**
 * TagRepository
 * タグのCRUD、ツールへのタグ紐付け、タグ検索
 * Requirements: 11.5, 11.6
 */

import { createClient } from '@/lib/supabase/server';
import type { Tag, TagWithCount, CreateTagData } from '@/lib/types/tag';
import type { Result, AppError } from '@/lib/types/result';

export class TagRepository {
  /**
   * タグを作成する
   * 既存のタグ名がある場合は既存タグを返す（冪等性）
   */
  async create(name: string): Promise<Result<Tag, Error>> {
    try {
      const supabase = await createClient();
      const normalizedName = name.toLowerCase().trim();

      // 既存タグをチェック
      const existingResult = await this.findByName(normalizedName);
      if (existingResult.success && existingResult.data) {
        return { success: true, data: existingResult.data };
      }

      // 新規作成
      const { data, error } = await (supabase
        .from('tags') as any)
        .insert({ name: normalizedName })
        .select()
        .single();

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * タグ名でタグを検索する（大文字小文字を区別しない）
   */
  async findByName(name: string): Promise<Result<Tag | null, Error>> {
    try {
      const supabase = await createClient();
      const normalizedName = name.toLowerCase().trim();

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .ilike('name', normalizedName)
        .limit(1)
        .maybeSingle();

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * ツールIDに紐付いた全タグを取得する
   */
  async findAllByToolId(toolId: string): Promise<Result<Tag[], Error>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('tool_tags')
        .select('tags(*)')
        .eq('tool_id', toolId) as { data: any; error: any };

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      // tool_tags.tags から tags を抽出
      const tags = data
        .map((row: any) => row.tags)
        .filter((tag: any): tag is Tag => tag !== null);

      return { success: true, data: tags };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * 全タグと使用回数を取得する
   */
  async findAllWithUsageCount(): Promise<Result<TagWithCount[], Error>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('tags')
        .select(`
          id,
          name,
          created_at,
          tool_tags(count)
        `) as { data: any; error: any };

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      // usage_count を計算
      const tagsWithCount: TagWithCount[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        usage_count: Array.isArray(row.tool_tags) ? row.tool_tags.length : 0,
      }));

      return { success: true, data: tagsWithCount };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * ツールにタグを紐付ける
   * 既に紐付いている場合はスキップ（エラーにしない）
   */
  async attachToTool(toolId: string, tagIds: string[]): Promise<Result<void, Error>> {
    try {
      const supabase = await createClient();

      // 既存の紐付けを取得
      const { data: existing, error: fetchError } = await supabase
        .from('tool_tags')
        .select('tag_id')
        .eq('tool_id', toolId) as { data: any; error: any };

      if (fetchError) {
        return { success: false, error: new Error(fetchError.message) };
      }

      const existingTagIds = new Set(existing?.map((row: any) => row.tag_id) || []);

      // 新規のタグIDのみ抽出
      const newTagIds = tagIds.filter(tagId => !existingTagIds.has(tagId));

      if (newTagIds.length === 0) {
        // すべて既に紐付いている場合はスキップ
        return { success: true, data: undefined };
      }

      // 新規紐付けを挿入
      const inserts = newTagIds.map(tagId => ({
        tool_id: toolId,
        tag_id: tagId,
      }));

      const { error: insertError } = await (supabase
        .from('tool_tags') as any)
        .insert(inserts);

      if (insertError) {
        return { success: false, error: new Error(insertError.message) };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * ツールからタグを削除する
   */
  async detachFromTool(toolId: string, tagIds: string[]): Promise<Result<void, Error>> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from('tool_tags')
        .delete()
        .eq('tool_id', toolId)
        .in('tag_id', tagIds);

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}
