import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionExpiredNotification } from '../session-expired-notification';

/**
 * セッション期限切れ通知のテスト
 *
 * Requirements: 2.2
 */

describe('SessionExpiredNotification', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnLogin: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnLogin = vi.fn();
  });

  describe('表示とメッセージ (Requirement 2.2)', () => {
    it('should display session expired message when isOpen is true', () => {
      render(
        <SessionExpiredNotification
          isOpen={true}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      expect(
        screen.getByText(/セッションの有効期限が切れました/)
      ).toBeInTheDocument();
    });

    it('should not display anything when isOpen is false', () => {
      const { container } = render(
        <SessionExpiredNotification
          isOpen={false}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should display user-friendly explanation', () => {
      render(
        <SessionExpiredNotification
          isOpen={true}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      expect(
        screen.getByText(/もう一度ログインしてください/)
      ).toBeInTheDocument();
    });
  });

  describe('ボタンの動作', () => {
    it('should call onLogin when login button is clicked', () => {
      render(
        <SessionExpiredNotification
          isOpen={true}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      const loginButton = screen.getByRole('button', {
        name: /ログインページへ/i,
      });
      fireEvent.click(loginButton);

      expect(mockOnLogin).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when outline close button is clicked', () => {
      render(
        <SessionExpiredNotification
          isOpen={true}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      const closeButtons = screen.getAllByRole('button', { name: /閉じる/i });
      // The outline button is the first "閉じる" button (not the X icon button)
      fireEvent.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when X icon button is clicked', () => {
      render(
        <SessionExpiredNotification
          isOpen={true}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      const closeButtons = screen.getAllByRole('button', { name: /閉じる/i });
      // The X icon button is the second "閉じる" button
      fireEvent.click(closeButtons[1]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('視覚的スタイル', () => {
    it('should have warning styling with yellow background', () => {
      render(
        <SessionExpiredNotification
          isOpen={true}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      const alertElement = screen.getByRole('alert');
      expect(alertElement).toHaveClass('bg-yellow-50');
      expect(alertElement).toHaveClass('border-yellow-500');
    });

    it('should display warning icon', () => {
      render(
        <SessionExpiredNotification
          isOpen={true}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      const alertElement = screen.getByRole('alert');
      const icon = alertElement.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('should use role="alert" for notification', () => {
      render(
        <SessionExpiredNotification
          isOpen={true}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      const alertElement = screen.getByRole('alert');
      expect(alertElement).toBeInTheDocument();
    });

    it('should have aria-live="assertive"', () => {
      render(
        <SessionExpiredNotification
          isOpen={true}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      const alertElement = screen.getByRole('alert');
      expect(alertElement).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have accessible button labels', () => {
      render(
        <SessionExpiredNotification
          isOpen={true}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      expect(
        screen.getByRole('button', { name: /ログインページへ/i })
      ).toBeInTheDocument();
      
      const closeButtons = screen.getAllByRole('button', { name: /閉じる/i });
      // Should have 2 close buttons (outline button and X icon button)
      expect(closeButtons).toHaveLength(2);
    });
  });

  describe('アニメーション', () => {
    it('should have animation classes', () => {
      render(
        <SessionExpiredNotification
          isOpen={true}
          onClose={mockOnClose}
          onLogin={mockOnLogin}
        />
      );

      const alertElement = screen.getByRole('alert');
      expect(alertElement).toHaveClass('animate-in');
    });
  });
});
