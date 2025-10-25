/**
 * 通知Server Actions
 * Requirements: 12.6, 12.7, 12.8
 */

'use server';

import { auth } from '@/auth';
import { notificationRepository } from '@/lib/repositories/notification-repository';
import { notificationSettingsRepository } from '@/lib/repositories/notification-settings-repository';
import type { Result } from '@/lib/types/result';
import type { Notification, NotificationSettings } from '@/lib/types/notification';

/**
 * 未読通知を取得する
 * @param limit 取得件数（デフォルト: 10）
 */
export async function getUnreadNotificationsAction(
  limit: number = 10
): Promise<Result<Notification[]>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '認証が必要です',
    };
  }

  return await notificationRepository.getUnreadNotifications(
    session.user.id,
    limit
  );
}

/**
 * 未読通知件数を取得する
 */
export async function getUnreadCountAction(): Promise<Result<number>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '認証が必要です',
    };
  }

  return await notificationRepository.getUnreadCount(session.user.id);
}

/**
 * 通知を既読にする
 * @param notificationId 通知ID
 */
export async function markNotificationAsReadAction(
  notificationId: string
): Promise<Result<void>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '認証が必要です',
    };
  }

  return await notificationRepository.markAsRead(notificationId);
}

/**
 * すべての通知を既読にする
 */
export async function markAllNotificationsAsReadAction(): Promise<Result<void>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '認証が必要です',
    };
  }

  return await notificationRepository.markAllAsRead(session.user.id);
}

/**
 * 通知設定を取得する
 */
export async function getNotificationSettingsAction(): Promise<
  Result<NotificationSettings>
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '認証が必要です',
    };
  }

  return await notificationSettingsRepository.getSettings(session.user.id);
}

/**
 * 通知設定を更新する
 */
export async function updateNotificationSettingsAction(
  settings: Omit<NotificationSettings, 'userId'>
): Promise<Result<void>> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: '認証が必要です',
    };
  }

  return await notificationSettingsRepository.updateSettings(
    session.user.id,
    settings
  );
}
