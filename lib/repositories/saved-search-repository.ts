/**
 * SavedSearchRepository
 * 保存済み検索のCRUD操作
 * Requirements: 11.3, 11.4
 */

import { createClient } from '@/lib/supabase/server';
import type { SavedSearch, CreateSavedSearchData } from '@/lib/types/saved-search';
import type { AdvancedSearchConditions } from '@/lib/types/search';
import type { Result, AppError } from '@/lib/types/result';

export class SavedSearchRepository {
  /**
   * 保存済み検索を作成する
   */
  async create(data: CreateSavedSearchData): Promise<Result<SavedSearch, Error>> {
    try {
      const supabase = await createClient();

      const { data: savedSearch, error } = await (supabase
        .from('saved_searches') as any)
        .insert({
          user_id: data.user_id,
          name: data.name,
          conditions: data.conditions,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, data: savedSearch };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * ユーザーIDで保存済み検索を全て取得する
   */
  async findAllByUserId(userId: string): Promise<Result<SavedSearch[], Error>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * IDで保存済み検索を取得する
   */
  async findById(id: string): Promise<Result<SavedSearch | null, Error>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('id', id)
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
   * 保存済み検索を更新する
   */
  async update(
    id: string,
    updates: { name?: string; conditions?: AdvancedSearchConditions }
  ): Promise<Result<SavedSearch, Error>> {
    try {
      const supabase = await createClient();

      const { data, error } = await (supabase
        .from('saved_searches') as any)
        .update(updates)
        .eq('id', id)
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
   * 保存済み検索を削除する
   */
  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}
