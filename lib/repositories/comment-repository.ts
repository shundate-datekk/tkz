/**
 * コメントリポジトリ
 * Requirements: 12.1, 12.2
 */

import { createClient } from '@/lib/supabase/server';
import type {
  Comment,
  CommentWithUser,
  CreateCommentInput,
  UpdateCommentInput,
} from '@/lib/types/comment';
import type { Result, AppError } from '@/lib/types/result';

export class CommentRepository {
  /**
   * ツールIDに紐づくコメント一覧を取得（ユーザー名付き、新しい順）
   */
  async findByToolId(toolId: string): Promise<Result<CommentWithUser[], AppError>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('comments')
        .select(
          `
          id,
          tool_id,
          user_id,
          content,
          created_at,
          updated_at,
          users:user_id (
            display_name
          )
        `
        )
        .eq('tool_id', toolId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch comments:', error);
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'コメントの取得に失敗しました',
          },
        };
      }

      // ユーザー名を展開
      const comments: CommentWithUser[] = (data || []).map((comment: any) => ({
        id: comment.id,
        tool_id: comment.tool_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user_name: comment.users?.display_name || '不明',
      }));

      return {
        success: true,
        data: comments,
      };
    } catch (error) {
      console.error('Unexpected error in findByToolId:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'コメントの取得中に予期しないエラーが発生しました',
        },
      };
    }
  }

  /**
   * コメントを新規作成
   */
  async create(
    input: CreateCommentInput,
    userId: string
  ): Promise<Result<Comment, AppError>> {
    try {
      const supabase = await createClient();

      const { data, error } = await (supabase
        .from('comments') as any)
        .insert({
          tool_id: input.toolId,
          user_id: userId,
          content: input.content,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create comment:', error);
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'コメントの投稿に失敗しました',
          },
        };
      }

      return {
        success: true,
        data: data as Comment,
      };
    } catch (error) {
      console.error('Unexpected error in create:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'コメントの投稿中に予期しないエラーが発生しました',
        },
      };
    }
  }

  /**
   * コメントを更新（本人のみ）
   */
  async update(
    input: UpdateCommentInput,
    userId: string
  ): Promise<Result<Comment, AppError>> {
    try {
      const supabase = await createClient();

      const { data, error } = await (supabase
        .from('comments') as any)
        .update({
          content: input.content,
        })
        .eq('id', input.commentId)
        .eq('user_id', userId) // 本人確認
        .select()
        .single();

      if (error) {
        console.error('Failed to update comment:', error);
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'コメントの更新に失敗しました',
          },
        };
      }

      if (!data) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'コメントが見つからないか、編集権限がありません',
          },
        };
      }

      return {
        success: true,
        data: data as Comment,
      };
    } catch (error) {
      console.error('Unexpected error in update:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'コメントの更新中に予期しないエラーが発生しました',
        },
      };
    }
  }

  /**
   * コメントを削除（本人のみ）
   */
  async delete(commentId: string, userId: string): Promise<Result<void, AppError>> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId); // 本人確認

      if (error) {
        console.error('Failed to delete comment:', error);
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'コメントの削除に失敗しました',
          },
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error('Unexpected error in delete:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'コメントの削除中に予期しないエラーが発生しました',
        },
      };
    }
  }

  /**
   * コメント数を取得
   */
  async countByToolId(toolId: string): Promise<Result<number, AppError>> {
    try {
      const supabase = await createClient();

      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('tool_id', toolId);

      if (error) {
        console.error('Failed to count comments:', error);
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'コメント数の取得に失敗しました',
          },
        };
      }

      return {
        success: true,
        data: count || 0,
      };
    } catch (error) {
      console.error('Unexpected error in countByToolId:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'コメント数の取得中に予期しないエラーが発生しました',
        },
      };
    }
  }
}

export const commentRepository = new CommentRepository();
