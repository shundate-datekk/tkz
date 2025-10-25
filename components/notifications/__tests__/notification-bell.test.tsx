/**
 * NotificationBell コンポーネントのテスト
 * Requirements: 12.6
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NotificationBell } from '../notification-bell';
import * as notificationActions from '@/lib/actions/notification.actions';

// Server Actionsをモック
vi.mock('@/lib/actions/notification.actions', () => ({
  getUnreadCountAction: vi.fn(),
}));

// Supabase clientをモック
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
      }),
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
    removeChannel: vi.fn(),
  },
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('未読件数の表示', () => {
    it('未読通知がない場合はバッジを表示しないべき', async () => {
      vi.mocked(notificationActions.getUnreadCountAction).mockResolvedValue({
        success: true,
        data: 0,
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByLabelText('通知')).toBeInTheDocument();
      });

      // バッジが表示されないことを確認
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('未読通知がある場合はバッジに件数を表示するべき', async () => {
      vi.mocked(notificationActions.getUnreadCountAction).mockResolvedValue({
        success: true,
        data: 5,
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });

    it('未読件数が100以上の場合は「99+」と表示するべき', async () => {
      vi.mocked(notificationActions.getUnreadCountAction).mockResolvedValue({
        success: true,
        data: 150,
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByText('99+')).toBeInTheDocument();
      });
    });

    it('未読件数が99の場合は「99」と表示するべき', async () => {
      vi.mocked(notificationActions.getUnreadCountAction).mockResolvedValue({
        success: true,
        data: 99,
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByText('99')).toBeInTheDocument();
      });
    });
  });

  describe('ベルアイコンの表示', () => {
    it('ベルアイコンが表示されるべき', async () => {
      vi.mocked(notificationActions.getUnreadCountAction).mockResolvedValue({
        success: true,
        data: 0,
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByLabelText('通知')).toBeInTheDocument();
      });

      // Bellアイコンが存在することを確認（lucide-reactのアイコンはsvgとしてレンダリングされる）
      const button = screen.getByLabelText('通知');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('エラーハンドリング', () => {
    it('API呼び出しが失敗してもエラーにならないべき', async () => {
      vi.mocked(notificationActions.getUnreadCountAction).mockResolvedValue({
        success: false,
        error: 'API Error',
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(screen.getByLabelText('通知')).toBeInTheDocument();
      });

      // バッジが表示されないことを確認
      expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
    });
  });

  describe('初回ロード', () => {
    it('初回ロード時に未読件数を取得するべき', async () => {
      vi.mocked(notificationActions.getUnreadCountAction).mockResolvedValue({
        success: true,
        data: 3,
      });

      render(<NotificationBell />);

      await waitFor(() => {
        expect(notificationActions.getUnreadCountAction).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('カスタムクラス名', () => {
    it('カスタムクラス名が適用されるべき', async () => {
      vi.mocked(notificationActions.getUnreadCountAction).mockResolvedValue({
        success: true,
        data: 0,
      });

      const { container } = render(<NotificationBell className="custom-class" />);

      await waitFor(() => {
        expect(container.querySelector('.custom-class')).toBeInTheDocument();
      });
    });
  });
});
