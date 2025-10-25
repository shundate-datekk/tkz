/**
 * NotificationRepository
 * 通知データアクセス層
 * Requirements: 12.6, 12.7, 12.8
 */

import { createClient } from '@/lib/supabase/server';
import type { Result } from '@/lib/types/result';
import type { Notification } from '@/lib/types/notification';

class NotificationRepository {
  /**
   * 未読通知を取得
   * @param userId ユーザーID
   * @param limit 取得件数（デフォルト: 10）
   */
  async getUnreadNotifications(
    userId: string,
    limit: number = 10
  ): Promise<Result<Notification[], string>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('notifications')
        .select(
          `
          id,
          user_id,
          actor_id,
          type,
          resource_type,
          resource_id,
          resource_name,
          message,
          is_read,
          created_at,
          users!notifications_actor_id_fkey (
            display_name
          )
        `
        )
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch unread notifications:', error);
        return {
          success: false,
          error: '未読通知の取得に失敗しました',
        };
      }

      const notifications: Notification[] = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        actorId: row.actor_id,
        actorName: row.users?.display_name || '不明なユーザー',
        type: row.type,
        resourceType: row.resource_type,
        resourceId: row.resource_id,
        resourceName: row.resource_name,
        message: row.message,
        isRead: row.is_read,
        createdAt: row.created_at,
      }));

      return {
        success: true,
        data: notifications,
      };
    } catch (error) {
      console.error('Unexpected error fetching unread notifications:', error);
      return {
        success: false,
        error: '予期しないエラーが発生しました',
      };
    }
  }

  /**
   * 未読通知件数を取得
   * @param userId ユーザーID
   */
  async getUnreadCount(userId: string): Promise<Result<number, string>> {
    try {
      const supabase = await createClient();

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Failed to fetch unread count:', error);
        return {
          success: false,
          error: '未読件数の取得に失敗しました',
        };
      }

      return {
        success: true,
        data: count || 0,
      };
    } catch (error) {
      console.error('Unexpected error fetching unread count:', error);
      return {
        success: false,
        error: '予期しないエラーが発生しました',
      };
    }
  }

  /**
   * 通知を既読にする
   * @param notificationId 通知ID
   */
  async markAsRead(notificationId: string): Promise<Result<void, string>> {
    try {
      const supabase = await createClient();

      const { error } = await (supabase
        .from('notifications') as any)
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Failed to mark notification as read:', error);
        return {
          success: false,
          error: '通知の既読処理に失敗しました',
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error('Unexpected error marking notification as read:', error);
      return {
        success: false,
        error: '予期しないエラーが発生しました',
      };
    }
  }

  /**
   * すべての通知を既読にする
   * @param userId ユーザーID
   */
  async markAllAsRead(userId: string): Promise<Result<void, string>> {
    try {
      const supabase = await createClient();

      const { error } = await (supabase
        .from('notifications') as any)
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Failed to mark all notifications as read:', error);
        return {
          success: false,
          error: 'すべての通知の既読処理に失敗しました',
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error('Unexpected error marking all notifications as read:', error);
      return {
        success: false,
        error: '予期しないエラーが発生しました',
      };
    }
  }
}

export const notificationRepository = new NotificationRepository();
