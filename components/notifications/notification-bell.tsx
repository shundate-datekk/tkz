/**
 * NotificationBell コンポーネント
 * 通知ベルアイコンと未読件数バッジを表示
 * Requirements: 12.6
 */

'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUnreadCountAction } from '@/lib/actions/notification.actions';
import { supabase } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { NotificationPanel } from './notification-panel';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    // 初回ロード時に未読件数を取得
    const fetchUnreadCount = async () => {
      setIsLoading(true);
      const result = await getUnreadCountAction();
      if (result.success) {
        setUnreadCount(result.data);
      }
      setIsLoading(false);
    };

    fetchUnreadCount();

    // Realtime購読を開始
    const setupRealtimeSubscription = async () => {
      // 現在のユーザーを取得
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        return;
      }

      // notificationsテーブルの変更を購読
      channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`,
          },
          () => {
            // 新しい通知が作成されたら未読件数を再取得
            fetchUnreadCount();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`,
          },
          () => {
            // 通知が更新されたら（既読化など）未読件数を再取得
            fetchUnreadCount();
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    // クリーンアップ
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <>
      <div className={className}>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="通知"
          disabled={isLoading}
          onClick={() => setIsPanelOpen(true)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      <NotificationPanel
        open={isPanelOpen}
        onOpenChange={setIsPanelOpen}
      />
    </>
  );
}
