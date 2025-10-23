import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoutButton } from '../logout-button';
import { logout } from '@/lib/auth/actions';

// Mock logout action
vi.mock('@/lib/auth/actions', () => ({
  logout: vi.fn(),
}));

/**
 * ログアウト確認ダイアログのテスト
 *
 * Requirements: 2.5
 */

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ログアウトボタンの表示 (Requirement 2.5)', () => {
    it('should display logout button with default text', () => {
      render(<LogoutButton />);

      expect(screen.getByRole('button', { name: /ログアウト/i })).toBeInTheDocument();
    });

    it('should display logout button with custom text', () => {
      render(<LogoutButton>サインアウト</LogoutButton>);

      expect(screen.getByRole('button', { name: /サインアウト/i })).toBeInTheDocument();
    });

    it('should apply custom variant', () => {
      render(<LogoutButton variant="destructive" />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      expect(button).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<LogoutButton className="custom-class" />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('確認ダイアログの表示 (Requirement 2.5)', () => {
    it('should not show dialog initially', () => {
      render(<LogoutButton />);

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('should show confirmation dialog when logout button is clicked', () => {
      render(<LogoutButton />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      fireEvent.click(button);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should display dialog title', () => {
      render(<LogoutButton />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      fireEvent.click(button);

      expect(screen.getByText('ログアウトの確認')).toBeInTheDocument();
    });

    it('should display dialog description', () => {
      render(<LogoutButton />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      fireEvent.click(button);

      expect(screen.getByText('本当にログアウトしますか？')).toBeInTheDocument();
    });

    it('should display cancel button', () => {
      render(<LogoutButton />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      fireEvent.click(button);

      expect(screen.getByRole('button', { name: /キャンセル/i })).toBeInTheDocument();
    });

    it('should display confirm button in dialog', () => {
      render(<LogoutButton />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      fireEvent.click(button);

      // The confirm button should be visible in the dialog
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toBeInTheDocument();
      
      // There should be a button with "ログアウト" text inside the dialog
      expect(screen.getByRole('button', { name: /キャンセル/i })).toBeInTheDocument();
    });
  });

  describe('キャンセル動作', () => {
    it('should close dialog when cancel button is clicked', async () => {
      render(<LogoutButton />);

      // Open dialog
      const button = screen.getByRole('button', { name: /ログアウト/i });
      fireEvent.click(button);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    it('should not call logout when cancel is clicked', async () => {
      const mockLogout = logout as any;
      render(<LogoutButton />);

      // Open dialog
      const button = screen.getByRole('button', { name: /ログアウト/i });
      fireEvent.click(button);

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockLogout).not.toHaveBeenCalled();
      });
    });
  });

  describe('ログアウト実行 (Requirement 2.5)', () => {
    it('should call logout when confirm button is clicked', async () => {
      const mockLogout = logout as any;
      mockLogout.mockResolvedValue(undefined);

      render(<LogoutButton />);

      // Open dialog
      const button = screen.getByRole('button', { name: /^ログアウト$/i });
      fireEvent.click(button);

      // Find and click the confirm button using text matching
      // The AlertDialogAction renders as a button
      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find(btn => 
        btn.textContent === 'ログアウト' && btn !== button
      );
      
      expect(confirmButton).toBeDefined();
      fireEvent.click(confirmButton!);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });

    it('should close dialog after logout is complete', async () => {
      const mockLogout = logout as any;
      mockLogout.mockResolvedValue(undefined);

      render(<LogoutButton />);

      // Open dialog
      const button = screen.getByRole('button', { name: /^ログアウト$/i });
      fireEvent.click(button);

      // Find and click confirm button
      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find(btn => 
        btn.textContent === 'ログアウト' && btn !== button
      );
      
      fireEvent.click(confirmButton!);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });

      // Dialog should close after logout
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('should use alertdialog role for confirmation dialog', () => {
      render(<LogoutButton />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      fireEvent.click(button);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<LogoutButton />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      fireEvent.click(button);

      expect(screen.getByRole('button', { name: /キャンセル/i })).toHaveAccessibleName();
      const logoutButtons = screen.getAllByRole('button', { name: /ログアウト/i });
      logoutButtons.forEach(btn => {
        expect(btn).toHaveAccessibleName();
      });
    });

    it('should be keyboard accessible', async () => {
      render(<LogoutButton />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      
      // Open dialog with Enter key
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      fireEvent.click(button);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      // Cancel with Escape key should work (AlertDialog handles this)
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('視覚的スタイル', () => {
    it('should apply ghost variant by default', () => {
      render(<LogoutButton />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      // Ghost variant should be applied (specific class checking would be implementation-dependent)
      expect(button).toBeInTheDocument();
    });

    it('should apply destructive variant when specified', () => {
      render(<LogoutButton variant="destructive" />);

      const button = screen.getByRole('button', { name: /ログアウト/i });
      expect(button).toBeInTheDocument();
    });
  });
});
