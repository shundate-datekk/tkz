/**
 * 活動フィードRepository
 * Requirements: 12.5
 */

import { supabase } from '@/lib/supabase/client';
import type { Result, AppError } from '@/lib/types/result';
import type { ActivityFeedItem } from '@/lib/types/activity';

export class ActivityFeedRepository {
  /**
   * 最近の活動を取得する（時系列降順）
   * @param limit 取得件数（デフォルト: 20）
   * @returns 活動フィードアイテムの配列
   */
  async getRecentActivities(limit: number = 20): Promise<Result<ActivityFeedItem[], AppError>> {
    try {
      const activities: ActivityFeedItem[] = [];

      // 1. ツール登録（tool_created）
      const { data: toolsCreated, error: toolsCreatedError } = await supabase
        .from('ai_tools')
        .select(`
          id,
          name,
          created_by,
          created_at,
          users:created_by (
            display_name
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (toolsCreatedError) throw toolsCreatedError;

      if (toolsCreated) {
        toolsCreated.forEach((tool: any) => {
          activities.push({
            id: `tool_created_${tool.id}`,
            type: 'tool_created',
            actorId: tool.created_by,
            actorName: tool.users?.display_name || '不明',
            resourceType: 'tool',
            resourceId: tool.id,
            resourceName: tool.name,
            message: `${tool.users?.display_name || '不明'}さんが新しいツール「${tool.name}」を登録しました`,
            createdAt: tool.created_at,
          });
        });
      }

      // 2. ツール編集（tool_updated）
      const { data: toolsUpdated, error: toolsUpdatedError } = await supabase
        .from('ai_tools')
        .select(`
          id,
          name,
          created_by,
          created_at,
          updated_at,
          users:created_by (
            display_name
          )
        `)
        .is('deleted_at', null)
        .neq('created_at', 'updated_at')
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (toolsUpdatedError) throw toolsUpdatedError;

      if (toolsUpdated) {
        toolsUpdated.forEach((tool: any) => {
          // created_atとupdated_atが異なる場合のみ編集とみなす
          if (tool.created_at !== tool.updated_at) {
            activities.push({
              id: `tool_updated_${tool.id}_${tool.updated_at}`,
              type: 'tool_updated',
              actorId: tool.created_by,
              actorName: tool.users?.display_name || '不明',
              resourceType: 'tool',
              resourceId: tool.id,
              resourceName: tool.name,
              message: `${tool.users?.display_name || '不明'}さんがツール「${tool.name}」を編集しました`,
              createdAt: tool.updated_at,
            });
          }
        });
      }

      // 3. いいね（like）
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select(`
          user_id,
          tool_id,
          created_at,
          users:user_id (
            display_name
          ),
          ai_tools:tool_id (
            name,
            deleted_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (likesError) throw likesError;

      if (likes) {
        likes.forEach((like: any) => {
          // 削除されたツールへのいいねは除外
          if (!like.ai_tools?.deleted_at) {
            activities.push({
              id: `like_${like.tool_id}_${like.user_id}`,
              type: 'like',
              actorId: like.user_id,
              actorName: like.users?.display_name || '不明',
              resourceType: 'tool',
              resourceId: like.tool_id,
              resourceName: like.ai_tools?.name || '不明',
              message: `${like.users?.display_name || '不明'}さんがツール「${like.ai_tools?.name || '不明'}」にいいねしました`,
              createdAt: like.created_at,
            });
          }
        });
      }

      // 4. コメント（comment）
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          user_id,
          tool_id,
          content,
          created_at,
          users:user_id (
            display_name
          ),
          ai_tools:tool_id (
            name,
            deleted_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (commentsError) throw commentsError;

      if (comments) {
        comments.forEach((comment: any) => {
          // 削除されたツールへのコメントは除外
          if (!comment.ai_tools?.deleted_at) {
            activities.push({
              id: `comment_${comment.id}`,
              type: 'comment',
              actorId: comment.user_id,
              actorName: comment.users?.display_name || '不明',
              resourceType: 'tool',
              resourceId: comment.tool_id,
              resourceName: comment.ai_tools?.name || '不明',
              message: `${comment.users?.display_name || '不明'}さんがツール「${comment.ai_tools?.name || '不明'}」にコメントしました`,
              createdAt: comment.created_at,
            });
          }
        });
      }

      // 時系列降順でソート
      activities.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // 上限件数まで絞り込み
      const limitedActivities = activities.slice(0, limit);

      return {
        success: true,
        data: limitedActivities,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: '活動フィードの取得に失敗しました',
          details: error,
        },
      };
    }
  }
}

export const activityFeedRepository = new ActivityFeedRepository();
