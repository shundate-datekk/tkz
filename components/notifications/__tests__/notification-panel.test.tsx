/**
 * NotificationPanel コンポーネントのテスト
 * Requirements: 12.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { NotificationPanel } from '../notification-panel';
import * as notificationActions from '@/lib/actions/notification.actions';

// Server Actionsをモック
vi.mock('@/lib/actions/notification.actions', () => ({
  getUnreadNotificationsAction: vi.fn(),
  markNotificationAsReadAction: vi.fn(),
  markAllNotificationsAsReadAction: vi.fn(),
}));

// Next.js Linkをモック
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('NotificationPanel', () => {
  const mockNotifications = [
    {
      id: 'notif-1',
      userId: 'user-1',
      actorId: 'user-2',
      actorName: 'TKZ',
      type: 'tool_created' as const,
      resourceType: 'tool' as const,
      resourceId: 'tool-1',
      resourceName: 'ChatGPT',
      message: 'TKZさんが新しいツール「ChatGPT」を登録しました',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      userId: 'user-1',
      actorId: 'user-2',
      actorName: 'コボちゃん',
      type: 'comment' as const,
      resourceType: 'comment' as const,
      resourceId: 'comment-1',
      resourceName: 'ChatGPT',
      message: 'コボちゃんさんがツール「ChatGPT」にコメントしました',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('パネルの表示', () => {
    it('閉じている時は表示されないべき', () => {
      vi.mocked(notificationActions.getUnreadNotificationsAction).mockResolvedValue({
        success: true,
        data: [],
      });

      render(<NotificationPanel open={false} onOpenChange={() => {}} />);

      expect(screen.queryByText('通知')).not.toBeInTheDocument();
    });

    it('開いている時はタイトルが表示されるべき', async () => {
      vi.mocked(notificationActions.getUnreadNotificationsAction).mockResolvedValue({
        success: true,
        data: mockNotifications,
      });

      render(<NotificationPanel open={true} onOpenChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('通知')).toBeInTheDocument();
      });
    });
  });

  describe('通知リストの表示', () => {
    it('通知がある場合は通知リストを表示するべき', async () => {
      vi.mocked(notificationActions.getUnreadNotificationsAction).mockResolvedValue({
        success: true,
        data: mockNotifications,
      });

      render(<NotificationPanel open={true} onOpenChange={() => {}} />);

      await waitFor(() => {
        expect(
          screen.getByText('TKZさんが新しいツール「ChatGPT」を登録しました')
        ).toBeInTheDocument();
        expect(
          screen.getByText('コボちゃんさんがツール「ChatGPT」にコメントしました')
        ).toBeInTheDocument();
      });
    });

    it('通知がない場合は空の状態を表示するべき', async () => {
      vi.mocked(notificationActions.getUnreadNotificationsAction).mockResolvedValue({
        success: true,
        data: [],
      });

      render(<NotificationPanel open={true} onOpenChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('未読の通知はありません')).toBeInTheDocument();
      });
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はスケルトンを表示するべき', async () => {
      vi.mocked(notificationActions.getUnreadNotificationsAction).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ success: true, data: [] }),
              100
            )
          )
      );

      render(<NotificationPanel open={true} onOpenChange={() => {}} />);

      const skeletons = screen.getAllByTestId('notification-panel-skeleton');
      expect(skeletons).toHaveLength(5);
    });
  });

  describe('すべて既読にする機能', () => {
    it('「すべて既読にする」ボタンが表示されるべき', async () => {
      vi.mocked(notificationActions.getUnreadNotificationsAction).mockResolvedValue({
        success: true,
        data: mockNotifications,
      });

      render(<NotificationPanel open={true} onOpenChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('すべて既読にする')).toBeInTheDocument();
      });
    });

    it('「すべて既読にする」ボタンをクリックすると全通知が既読になるべき', async () => {
      vi.mocked(notificationActions.getUnreadNotificationsAction).mockResolvedValue({
        success: true,
        data: mockNotifications,
      });
      vi.mocked(notificationActions.markAllNotificationsAsReadAction).mockResolvedValue({
        success: true,
        data: undefined,
      });

      render(<NotificationPanel open={true} onOpenChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('すべて既読にする')).toBeInTheDocument();
      });

      const markAllButton = screen.getByText('すべて既読にする');
      fireEvent.click(markAllButton);

      await waitFor(() => {
        expect(
          notificationActions.markAllNotificationsAsReadAction
        ).toHaveBeenCalled();
      });
    });

    it('通知がない場合は「すべて既読にする」ボタンを表示しないべき', async () => {
      vi.mocked(notificationActions.getUnreadNotificationsAction).mockResolvedValue({
        success: true,
        data: [],
      });

      render(<NotificationPanel open={true} onOpenChange={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('未読の通知はありません')).toBeInTheDocument();
      });

      expect(screen.queryByText('すべて既読にする')).not.toBeInTheDocument();
    });
  });

  describe('パネルを開いた時の動作', () => {
    it('パネルを開いた時に通知を取得するべき', async () => {
      vi.mocked(notificationActions.getUnreadNotificationsAction).mockResolvedValue({
        success: true,
        data: mockNotifications,
      });

      const { rerender } = render(
        <NotificationPanel open={false} onOpenChange={() => {}} />
      );

      expect(notificationActions.getUnreadNotificationsAction).not.toHaveBeenCalled();

      rerender(<NotificationPanel open={true} onOpenChange={() => {}} />);

      await waitFor(() => {
        expect(notificationActions.getUnreadNotificationsAction).toHaveBeenCalledWith(20);
      });
    });
  });
});
