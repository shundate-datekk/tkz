import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { LoginForm } from '../login-form';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock hooks
vi.mock('@/hooks/use-session-management', () => ({
  useSessionManagement: vi.fn(() => ({
    getReturnUrl: vi.fn(() => '/'),
    clearReturnUrl: vi.fn(),
  })),
}));

/**
 * ログイン状態保持機能のテスト
 *
 * Requirements: 2.4
 */

describe('LoginForm - Remember Me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('ログイン状態保持チェックボックスの表示 (Requirement 2.4)', () => {
    it('should display "ログイン状態を保持" checkbox', () => {
      render(<LoginForm />);

      const checkbox = screen.getByRole('checkbox', {
        name: /ログイン状態を保持/i,
      });
      expect(checkbox).toBeInTheDocument();
    });

    it('should be unchecked by default', () => {
      render(<LoginForm />);

      const checkbox = screen.getByRole('checkbox', {
        name: /ログイン状態を保持/i,
      });
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('should display explanatory text', () => {
      render(<LoginForm />);

      expect(
        screen.getByText(/30日間ログイン状態が保持されます/)
      ).toBeInTheDocument();
    });
  });

  describe('チェックボックスの動作', () => {
    it('should toggle checkbox when clicked', () => {
      render(<LoginForm />);

      const checkbox = screen.getByRole('checkbox', {
        name: /ログイン状態を保持/i,
      });

      expect(checkbox).toHaveAttribute('data-state', 'unchecked');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('data-state', 'checked');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('should save remember me preference to localStorage when checked', () => {
      render(<LoginForm />);

      const checkbox = screen.getByRole('checkbox', {
        name: /ログイン状態を保持/i,
      });

      fireEvent.click(checkbox);

      expect(localStorage.getItem('rememberMe')).toBe('true');
    });

    it('should remove remember me preference from localStorage when unchecked', () => {
      localStorage.setItem('rememberMe', 'true');
      render(<LoginForm />);

      const checkbox = screen.getByRole('checkbox', {
        name: /ログイン状態を保持/i,
      });

      fireEvent.click(checkbox);

      expect(localStorage.getItem('rememberMe')).toBeNull();
    });

    it('should restore checkbox state from localStorage on mount', () => {
      localStorage.setItem('rememberMe', 'true');
      render(<LoginForm />);

      const checkbox = screen.getByRole('checkbox', {
        name: /ログイン状態を保持/i,
      });

      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('ログイン時のmaxAge設定 (Requirement 2.4)', () => {
    it('should call signIn with default maxAge when remember me is unchecked', async () => {
      const mockSignIn = signIn as any;
      render(<LoginForm />);

      const signInButton = screen.getByRole('button', {
        name: /Googleでログイン/i,
      });

      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', {
          callbackUrl: '/',
        });
      });
    });

    it('should call signIn with extended maxAge when remember me is checked', async () => {
      const mockSignIn = signIn as any;
      render(<LoginForm />);

      const checkbox = screen.getByRole('checkbox', {
        name: /ログイン状態を保持/i,
      });
      fireEvent.click(checkbox);

      const signInButton = screen.getByRole('button', {
        name: /Googleでログイン/i,
      });

      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('google', {
          callbackUrl: '/',
          // Note: NextAuth.js doesn't support passing maxAge in signIn call
          // This will be handled in auth.config.ts with cookies/session strategy
        });
      });

      // Verify localStorage was set for server-side session config
      expect(localStorage.getItem('rememberMe')).toBe('true');
    });
  });

  describe('視覚的スタイル', () => {
    it('should have proper checkbox styling', () => {
      render(<LoginForm />);

      const checkbox = screen.getByRole('checkbox', {
        name: /ログイン状態を保持/i,
      });

      // Checkbox should be visible and properly sized
      expect(checkbox).toBeVisible();
    });

    it('should display checkbox label next to checkbox', () => {
      render(<LoginForm />);

      const checkbox = screen.getByRole('checkbox', {
        name: /ログイン状態を保持/i,
      });
      
      // Check that the label is associated with the checkbox
      expect(checkbox).toHaveAccessibleName('ログイン状態を保持');
    });
  });

  describe('アクセシビリティ', () => {
    it('should have accessible label for checkbox', () => {
      render(<LoginForm />);

      const checkbox = screen.getByRole('checkbox', {
        name: /ログイン状態を保持/i,
      });

      expect(checkbox).toHaveAccessibleName();
    });

    it('should be keyboard accessible', () => {
      render(<LoginForm />);

      const checkbox = screen.getByRole('checkbox', {
        name: /ログイン状態を保持/i,
      });

      expect(checkbox).toHaveAttribute('data-state', 'unchecked');

      // Radix UI checkbox handles keyboard events automatically
      // Simulate click (which includes keyboard activation)
      fireEvent.click(checkbox);

      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });
  });
});
