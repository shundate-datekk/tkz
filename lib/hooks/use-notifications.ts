"use client";

import useSWR, { mutate } from "swr";
import type { Notification } from "@/lib/types/notification";

/**
 * 通知取得のフェッチャー関数
 */
async function fetchNotifications(url: string): Promise<Notification[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  const data = await response.json();
  return data.success ? data.data : [];
}

/**
 * 未読通知件数取得のフェッチャー関数
 */
async function fetchUnreadCount(url: string): Promise<number> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch unread count");
  }
  const data = await response.json();
  return data.success ? data.data : 0;
}

/**
 * 未読通知一覧を取得するSWRフック
 *
 * @param userId - ユーザーID
 * @param limit - 取得件数
 * @returns 未読通知一覧とSWR状態
 *
 * @example
 * ```tsx
 * const { notifications, isLoading, error, mutate } = useUnreadNotifications("user-123", 10);
 * ```
 */
export function useUnreadNotifications(userId: string | null, limit: number = 10) {
  const { data, error, isLoading, mutate: swrMutate, isValidating } = useSWR<Notification[]>(
    userId ? `/api/notifications/unread?userId=${userId}&limit=${limit}` : null,
    fetchNotifications,
    {
      // 1分間キャッシュ（通知は頻繁に更新される可能性がある）
      dedupingInterval: 60 * 1000,
      // フォーカス時に再検証（新しい通知を見逃さないため）
      revalidateOnFocus: true,
      // 再接続時に再検証
      revalidateOnReconnect: true,
      // 定期的な再検証（30秒ごと）
      refreshInterval: 30 * 1000,
      // エラー時の再試行設定
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  return {
    notifications: data ?? [],
    isLoading,
    isValidating,
    error,
    mutate: swrMutate,

    /**
     * 通知を既読にする（楽観的更新）
     */
    markAsReadOptimistic: (notificationId: string) => {
      swrMutate(
        (currentNotifications: Notification[] = []) =>
          currentNotifications.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          ),
        { revalidate: false }
      );
    },

    /**
     * すべての通知を既読にする（楽観的更新）
     */
    markAllAsReadOptimistic: () => {
      swrMutate(
        (currentNotifications: Notification[] = []) =>
          currentNotifications.map((notif) => ({ ...notif, isRead: true })),
        { revalidate: false }
      );
    },
  };
}

/**
 * 未読通知件数を取得するSWRフック
 *
 * @param userId - ユーザーID
 * @returns 未読通知件数とSWR状態
 *
 * @example
 * ```tsx
 * const { unreadCount, isLoading, error, mutate } = useUnreadCount("user-123");
 * ```
 */
export function useUnreadCount(userId: string | null) {
  const { data, error, isLoading, mutate: swrMutate, isValidating } = useSWR<number>(
    userId ? `/api/notifications/unread-count?userId=${userId}` : null,
    fetchUnreadCount,
    {
      // 1分間キャッシュ
      dedupingInterval: 60 * 1000,
      // フォーカス時に再検証
      revalidateOnFocus: true,
      // 再接続時に再検証
      revalidateOnReconnect: true,
      // 定期的な再検証（30秒ごと）
      refreshInterval: 30 * 1000,
      // エラー時の再試行設定
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  return {
    unreadCount: data ?? 0,
    isLoading,
    isValidating,
    error,
    mutate: swrMutate,

    /**
     * 未読件数を減らす（楽観的更新）
     */
    decrementOptimistic: () => {
      swrMutate((current: number = 0) => Math.max(0, current - 1), { revalidate: false });
    },

    /**
     * 未読件数をゼロにする（楽観的更新）
     */
    resetOptimistic: () => {
      swrMutate(0, { revalidate: false });
    },

    /**
     * 未読件数を増やす（楽観的更新）
     */
    incrementOptimistic: () => {
      swrMutate((current: number = 0) => current + 1, { revalidate: false });
    },
  };
}

/**
 * 通知キャッシュキー
 */
export const NOTIFICATIONS_CACHE_KEY = "/api/notifications/unread";
export const UNREAD_COUNT_CACHE_KEY = "/api/notifications/unread-count";

/**
 * すべての通知キャッシュを手動で無効化
 */
export async function invalidateNotificationCache(userId: string) {
  await mutate(`${NOTIFICATIONS_CACHE_KEY}?userId=${userId}`);
  await mutate(`${UNREAD_COUNT_CACHE_KEY}?userId=${userId}`);
}
