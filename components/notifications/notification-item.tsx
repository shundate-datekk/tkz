/**
 * NotificationItem コンポーネント
 * 個別の通知アイテムを表示
 * Requirements: 12.8
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Heart, MessageSquare, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Notification, NotificationType } from '@/lib/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
}

/**
 * 通知タイプに応じたアイコンを返す
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'tool_created':
      return <Plus className="h-5 w-5 text-primary" />;
    case 'like':
      return <Heart className="h-5 w-5 text-red-500" />;
    case 'comment':
      return <MessageSquare className="h-5 w-5 text-green-500" />;
  }
}

/**
 * 通知タイプに応じた色を返す
 */
function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'tool_created':
      return 'bg-primary/10 text-primary';
    case 'like':
      return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300';
    case 'comment':
      return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
  }
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const createdDate = new Date(notification.createdAt);
  const relativeTime = formatDistanceToNow(createdDate, {
    addSuffix: true,
    locale: ja,
  });

  const handleClick = () => {
    onMarkAsRead(notification.id);
  };

  return (
    <div className="group relative rounded-lg border bg-card p-3 transition-colors hover:bg-accent">
      <Link
        href={`/tools/${notification.resourceId}`}
        className="block"
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          {/* アイコン */}
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getNotificationColor(notification.type)}`}
          >
            {getNotificationIcon(notification.type)}
          </div>

          {/* 内容 */}
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-snug">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground">{relativeTime}</p>
          </div>

          {/* 既読ボタン */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClick();
            }}
            aria-label="既読にする"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </Link>
    </div>
  );
}
