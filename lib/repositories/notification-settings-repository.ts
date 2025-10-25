/**
 * NotificationSettingsRepository
 * 通知設定データアクセス層
 * Requirements: 12.8
 */

import { createClient } from '@/lib/supabase/server';
import type { Result } from '@/lib/types/result';
import type { NotificationSettings } from '@/lib/types/notification';

class NotificationSettingsRepository {
  /**
   * 通知設定を取得（存在しない場合はデフォルト値を返す）
   */
  async getSettings(userId: string): Promise<Result<NotificationSettings, string>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single() as { data: any; error: any };

      if (error) {
        // レコードが存在しない場合はデフォルト値を返す
        if (error.code === 'PGRST116') {
          return {
            success: true,
            data: {
              userId,
              enableToolCreated: true,
              enableComment: true,
              enableLike: true,
            },
          };
        }

        console.error('Failed to fetch notification settings:', error);
        return {
          success: false,
          error: '通知設定の取得に失敗しました',
        };
      }

      return {
        success: true,
        data: {
          userId: data.user_id,
          enableToolCreated: data.enable_tool_created,
          enableComment: data.enable_comment,
          enableLike: data.enable_like,
        },
      };
    } catch (error) {
      console.error('Unexpected error fetching notification settings:', error);
      return {
        success: false,
        error: '予期しないエラーが発生しました',
      };
    }
  }

  /**
   * 通知設定を更新（存在しない場合は作成）
   */
  async updateSettings(
    userId: string,
    settings: Omit<NotificationSettings, 'userId'>
  ): Promise<Result<void, string>> {
    try {
      const supabase = await createClient();

      const { error } = await (supabase
        .from('notification_settings') as any)
        .upsert({
          user_id: userId,
          enable_tool_created: settings.enableToolCreated,
          enable_comment: settings.enableComment,
          enable_like: settings.enableLike,
        });

      if (error) {
        console.error('Failed to update notification settings:', error);
        return {
          success: false,
          error: '通知設定の更新に失敗しました',
        };
      }

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error('Unexpected error updating notification settings:', error);
      return {
        success: false,
        error: '予期しないエラーが発生しました',
      };
    }
  }
}

export const notificationSettingsRepository = new NotificationSettingsRepository();
