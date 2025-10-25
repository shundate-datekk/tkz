/**
 * コメント関連のServer Actions
 * Requirements: 12.1, 12.2
 */

'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { commentRepository } from '@/lib/repositories/comment-repository';
import { notifyCommentCreated } from '@/lib/utils/notification-helper';
import { createClient } from '@/lib/supabase/server';
import type {
  CreateCommentInput,
  UpdateCommentInput,
  Comment,
  CommentWithUser,
} from '@/lib/types/comment';
import type { Result } from '@/lib/types/result';

/**
 * コメントを作成
 */
export async function createCommentAction(
  input: CreateCommentInput
): Promise<Result<Comment>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      };
    }

    // バリデーション
    if (!input.content || input.content.trim().length === 0) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'コメントを入力してください',
        },
      };
    }

    if (input.content.length > 1000) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'コメントは1000文字以内で入力してください',
        },
      };
    }

    const result = await commentRepository.create(input, session.user.id);

    if (result.success) {
      // ツール詳細ページを再検証
      revalidatePath(`/tools/${input.toolId}`);

      // ツールの作成者に通知を送信
      try {
        const supabase = await createClient();

        // ツール情報を取得
        const { data: tool } = await supabase
          .from('ai_tools')
          .select('name, user_id')
          .eq('id', input.toolId)
          .single();

        // 現在のユーザー情報を取得
        const { data: currentUser } = await supabase
          .from('users')
          .select('display_name')
          .eq('id', session.user.id)
          .single();

        // ツールの作成者が自分でない場合のみ通知を送信
        if (tool && currentUser && tool.user_id !== session.user.id) {
          await notifyCommentCreated({
            commentId: result.data.id,
            toolId: input.toolId,
            toolName: tool.name,
            authorId: session.user.id,
            authorName: currentUser.display_name || '不明なユーザー',
            recipientId: tool.user_id,
          });
        }
      } catch (notificationError) {
        // 通知の送信に失敗してもコメント作成自体は成功として扱う
        console.error('Failed to send comment notification:', notificationError);
      }
    }

    return result;
  } catch (error) {
    console.error('Unexpected error in createCommentAction:', error);
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
 * コメントを更新
 */
export async function updateCommentAction(
  input: UpdateCommentInput
): Promise<Result<Comment>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      };
    }

    // バリデーション
    if (!input.content || input.content.trim().length === 0) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'コメントを入力してください',
        },
      };
    }

    if (input.content.length > 1000) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'コメントは1000文字以内で入力してください',
        },
      };
    }

    const result = await commentRepository.update(input, session.user.id);

    if (result.success) {
      // ツール詳細ページを再検証（tool_idが必要なので、更新後のコメントから取得）
      revalidatePath(`/tools/${result.data.tool_id}`);
    }

    return result;
  } catch (error) {
    console.error('Unexpected error in updateCommentAction:', error);
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
 * コメントを削除
 */
export async function deleteCommentAction(
  commentId: string
): Promise<Result<void>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      };
    }

    const result = await commentRepository.delete(commentId, session.user.id);

    if (result.success) {
      // すべてのツールページを再検証（tool_idが不明なため）
      revalidatePath('/tools/[id]', 'page');
    }

    return result;
  } catch (error) {
    console.error('Unexpected error in deleteCommentAction:', error);
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
 * ツールIDに紐づくコメント一覧を取得
 */
export async function getCommentsByToolIdAction(
  toolId: string
): Promise<Result<CommentWithUser[]>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      };
    }

    return await commentRepository.findByToolId(toolId);
  } catch (error) {
    console.error('Unexpected error in getCommentsByToolIdAction:', error);
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
 * ツールのコメント数を取得
 */
export async function getCommentCountAction(
  toolId: string
): Promise<Result<number>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'ログインが必要です',
        },
      };
    }

    return await commentRepository.countByToolId(toolId);
  } catch (error) {
    console.error('Unexpected error in getCommentCountAction:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'コメント数の取得中に予期しないエラーが発生しました',
      },
    };
  }
}
