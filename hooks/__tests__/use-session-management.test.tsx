import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSessionManagement } from '../use-session-management';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/tools'),
}));

/**
 * セッション管理機能のテスト
 *
 * Requirements: 2.2, 2.3
 */

describe('useSessionManagement', () => {
  let mockRouter: any;
  let mockUseSession: any;

  beforeEach(() => {
    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
    };
    (useRouter as any).mockReturnValue(mockRouter);
    mockUseSession = useSession as any;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('セッション状態の管理 (Requirement 2.2)', () => {
    it('should detect authenticated session', () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isSessionExpired).toBe(false);
    });

    it('should detect unauthenticated session', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isSessionExpired).toBe(false);
    });

    it('should handle loading state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isSessionExpired).toBe(false);
    });
  });

  describe('セッション期限切れの検出 (Requirement 2.2)', () => {
    it('should detect session expiration when previously authenticated', async () => {
      // First render with authenticated session
      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });

      const { result, rerender } = renderHook(() => useSessionManagement());

      expect(result.current.isSessionExpired).toBe(false);

      // Simulate session expiration
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      rerender();

      await waitFor(() => {
        expect(result.current.isSessionExpired).toBe(true);
      });
    });

    it('should not detect expiration on initial unauthenticated state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.isSessionExpired).toBe(false);
    });

    it('should not detect expiration during loading state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.isSessionExpired).toBe(false);
    });
  });

  describe('現在のページURLの保存 (Requirement 2.3)', () => {
    it('should save current URL when session expires', async () => {
      const mockPathname = '/tools';
      const { usePathname } = await import('next/navigation');
      (usePathname as any).mockReturnValue(mockPathname);

      // Authenticated session
      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });

      const { rerender } = renderHook(() => useSessionManagement());

      // Session expires
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      rerender();

      await waitFor(() => {
        expect(localStorage.getItem('returnUrl')).toBe(mockPathname);
      });
    });

    it('should not save URL for public pages', async () => {
      const mockPathname = '/login';
      const { usePathname } = await import('next/navigation');
      (usePathname as any).mockReturnValue(mockPathname);

      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });

      const { rerender } = renderHook(() => useSessionManagement());

      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      rerender();

      await waitFor(() => {
        expect(localStorage.getItem('returnUrl')).toBeNull();
      });
    });

    it('should not save URL for auth pages', async () => {
      const mockPathname = '/auth/signin';
      const { usePathname } = await import('next/navigation');
      (usePathname as any).mockReturnValue(mockPathname);

      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });

      const { rerender } = renderHook(() => useSessionManagement());

      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      rerender();

      await waitFor(() => {
        expect(localStorage.getItem('returnUrl')).toBeNull();
      });
    });
  });

  describe('ログイン後の復帰URL取得 (Requirement 2.3)', () => {
    it('should return saved return URL', () => {
      const savedUrl = '/tools/new';
      localStorage.setItem('returnUrl', savedUrl);

      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.getReturnUrl()).toBe(savedUrl);
    });

    it('should return default URL when no saved URL', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.getReturnUrl()).toBe('/');
    });

    it('should clear return URL after retrieval', () => {
      const savedUrl = '/tools/new';
      localStorage.setItem('returnUrl', savedUrl);

      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useSessionManagement());

      result.current.clearReturnUrl();

      expect(localStorage.getItem('returnUrl')).toBeNull();
    });
  });

  describe('セッション期限切れ時のリダイレクト (Requirement 2.2)', () => {
    it('should redirect to login when session expires', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });

      const { rerender } = renderHook(() =>
        useSessionManagement({ redirectOnExpire: true })
      );

      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      rerender();

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login');
      });
    });

    it('should not redirect when redirectOnExpire is false', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });

      const { rerender } = renderHook(() =>
        useSessionManagement({ redirectOnExpire: false })
      );

      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      rerender();

      await waitFor(() => {
        expect(mockRouter.push).not.toHaveBeenCalled();
      });
    });

    it('should call onSessionExpire callback when provided', async () => {
      const onSessionExpire = vi.fn();

      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });

      const { rerender } = renderHook(() =>
        useSessionManagement({ onSessionExpire })
      );

      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      rerender();

      await waitFor(() => {
        expect(onSessionExpire).toHaveBeenCalled();
      });
    });
  });

  describe('セッション有効性チェック', () => {
    it('should validate authenticated session', () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.isSessionValid()).toBe(true);
    });

    it('should invalidate unauthenticated session', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.isSessionValid()).toBe(false);
    });

    it('should treat loading as invalid session', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useSessionManagement());

      expect(result.current.isSessionValid()).toBe(false);
    });
  });
});
