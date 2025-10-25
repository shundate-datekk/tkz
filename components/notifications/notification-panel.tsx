/**
 * NotificationPanel コンポーネント
 * 通知一覧を表示するパネル
 * Requirements: 12.8
 */

'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Bell, Check, CheckCheck, Settings } from 'lucide-react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationItem } from './notification-item';
import {
  getUnreadNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from '@/lib/actions/notification.actions';
import type { Notification } from '@/lib/types/notification';

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPanel({
  open,
  onOpenChange,
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const result = await getUnreadNotificationsAction(20);
    if (result.success) {
      setNotifications(result.data);
    }
    setIsLoading(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markNotificationAsReadAction(notificationId);
    if (result.success) {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsReadAction();
    if (result.success) {
      setNotifications([]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            通知
          </SheetTitle>
          <SheetDescription>
            未読の通知を確認できます
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* アクションボタン */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                すべて既読にする
              </Button>
            </div>
          )}

          {/* 通知リスト */}
          <ScrollArea className="h-[calc(100vh-240px)]">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <NotificationPanelSkeleton key={i} />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  未読の通知はありません
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * 通知パネルスケルトン
 */
function NotificationPanelSkeleton() {
  return (
    <div
      className="flex items-start gap-3 rounded-lg border p-3"
      data-testid="notification-panel-skeleton"
    >
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  );
}
