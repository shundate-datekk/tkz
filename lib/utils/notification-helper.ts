/**
 * 通知作成ヘルパー関数
 * Requirements: 12.7
 */

import { createClient } from '@/lib/supabase/server';
import type { NotificationType } from '@/lib/types/notification';

interface CreateNotificationParams {
  userId: string; // 通知を受け取るユーザーID
  actorId: string; // アクションを起こしたユーザーID
  type: NotificationType;
  resourceType: 'tool' | 'comment';
  resourceId: string;
  resourceName: string;
  message: string;
}

/**
 * 通知を作成する
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    // 自分自身への通知は作成しない
    if (params.userId === params.actorId) {
      return { success: true };
    }

    const supabase = await createClient();

    const { error } = await (supabase.from('notifications') as any).insert({
      user_id: params.userId,
      actor_id: params.actorId,
      type: params.type,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      resource_name: params.resourceName,
      message: params.message,
      is_read: false,
    });

    if (error) {
      console.error('Failed to create notification:', error);
      return {
        success: false,
        error: '通知の作成に失敗しました',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error creating notification:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました',
    };
  }
}

/**
 * ツール登録時の通知を作成
 */
export async function notifyToolCreated(params: {
  toolId: string;
  toolName: string;
  authorId: string;
  authorName: string;
  recipientId: string; // 通知を受け取るユーザー（相手のユーザー）
}): Promise<{ success: boolean; error?: string }> {
  return createNotification({
    userId: params.recipientId,
    actorId: params.authorId,
    type: 'tool_created',
    resourceType: 'tool',
    resourceId: params.toolId,
    resourceName: params.toolName,
    message: `${params.authorName}さんが新しいツール「${params.toolName}」を登録しました`,
  });
}

/**
 * コメント投稿時の通知を作成
 */
export async function notifyCommentCreated(params: {
  commentId: string;
  toolId: string;
  toolName: string;
  authorId: string;
  authorName: string;
  recipientId: string; // ツールの作成者など
}): Promise<{ success: boolean; error?: string }> {
  return createNotification({
    userId: params.recipientId,
    actorId: params.authorId,
    type: 'comment',
    resourceType: 'comment',
    resourceId: params.commentId,
    resourceName: params.toolName,
    message: `${params.authorName}さんがツール「${params.toolName}」にコメントしました`,
  });
}

/**
 * いいね時の通知を作成
 */
export async function notifyLikeCreated(params: {
  toolId: string;
  toolName: string;
  authorId: string;
  authorName: string;
  recipientId: string; // ツールの作成者
}): Promise<{ success: boolean; error?: string }> {
  return createNotification({
    userId: params.recipientId,
    actorId: params.authorId,
    type: 'like',
    resourceType: 'tool',
    resourceId: params.toolId,
    resourceName: params.toolName,
    message: `${params.authorName}さんがツール「${params.toolName}」にいいねしました`,
  });
}
