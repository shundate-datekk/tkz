/**
 * NotificationItem コンポーネントのテスト
 * Requirements: 12.8
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationItem } from '../notification-item';
import type { Notification } from '@/lib/types/notification';

// Next.js Linkをモック
vi.mock('next/link', () => ({
  default: ({ children, href, onClick, ...props }: any) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

describe('NotificationItem', () => {
  const mockOnMarkAsRead = vi.fn();

  const toolCreatedNotification: Notification = {
    id: 'notif-1',
    userId: 'user-1',
    actorId: 'user-2',
    actorName: 'TKZ',
    type: 'tool_created',
    resourceType: 'tool',
    resourceId: 'tool-1',
    resourceName: 'ChatGPT',
    message: 'TKZさんが新しいツール「ChatGPT」を登録しました',
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  const commentNotification: Notification = {
    id: 'notif-2',
    userId: 'user-1',
    actorId: 'user-2',
    actorName: 'コボちゃん',
    type: 'comment',
    resourceType: 'comment',
    resourceId: 'comment-1',
    resourceName: 'ChatGPT',
    message: 'コボちゃんさんがツール「ChatGPT」にコメントしました',
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  const likeNotification: Notification = {
    id: 'notif-3',
    userId: 'user-1',
    actorId: 'user-2',
    actorName: 'TKZ',
    type: 'like',
    resourceType: 'tool',
    resourceId: 'tool-1',
    resourceName: 'ChatGPT',
    message: 'TKZさんがツール「ChatGPT」にいいねしました',
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('通知メッセージの表示', () => {
    it('通知メッセージが表示されるべき', () => {
      render(
        <NotificationItem
          notification={toolCreatedNotification}
          onMarkAsRead={mockOnMarkAsRead}
        />
      );

      expect(
        screen.getByText('TKZさんが新しいツール「ChatGPT」を登録しました')
      ).toBeInTheDocument();
    });

    it('相対時間が表示されるべき', () => {
      render(
        <NotificationItem
          notification={toolCreatedNotification}
          onMarkAsRead={mockOnMarkAsRead}
        />
      );

      // 「〜前」という文字列が含まれることを確認
      expect(screen.getByText(/前$/)).toBeInTheDocument();
    });
  });

  describe('アイコンの表示', () => {
    it('tool_created タイプは Plus アイコンを表示するべき', () => {
      const { container } = render(
        <NotificationItem
          notification={toolCreatedNotification}
          onMarkAsRead={mockOnMarkAsRead}
        />
      );

      const iconElement = container.querySelector('.text-primary');
      expect(iconElement).toBeInTheDocument();
    });

    it('comment タイプは MessageSquare アイコンを表示するべき', () => {
      const { container } = render(
        <NotificationItem
          notification={commentNotification}
          onMarkAsRead={mockOnMarkAsRead}
        />
      );

      const iconElement = container.querySelector('.text-green-500');
      expect(iconElement).toBeInTheDocument();
    });

    it('like タイプは Heart アイコンを表示するべき', () => {
      const { container } = render(
        <NotificationItem
          notification={likeNotification}
          onMarkAsRead={mockOnMarkAsRead}
        />
      );

      const iconElement = container.querySelector('.text-red-500');
      expect(iconElement).toBeInTheDocument();
    });
  });

  describe('既読機能', () => {
    it('通知をクリックすると既読にするコールバックが呼ばれるべき', () => {
      render(
        <NotificationItem
          notification={toolCreatedNotification}
          onMarkAsRead={mockOnMarkAsRead}
        />
      );

      const link = screen.getByRole('link');
      fireEvent.click(link);

      expect(mockOnMarkAsRead).toHaveBeenCalledWith('notif-1');
    });

    it('既読ボタンをクリックすると既読にするコールバックが呼ばれるべき', () => {
      render(
        <NotificationItem
          notification={toolCreatedNotification}
          onMarkAsRead={mockOnMarkAsRead}
        />
      );

      const markAsReadButton = screen.getByLabelText('既読にする');
      fireEvent.click(markAsReadButton);

      expect(mockOnMarkAsRead).toHaveBeenCalledWith('notif-1');
    });
  });

  describe('リンク', () => {
    it('ツール詳細ページへのリンクが設定されているべき', () => {
      render(
        <NotificationItem
          notification={toolCreatedNotification}
          onMarkAsRead={mockOnMarkAsRead}
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/tools/tool-1');
    });
  });
});
