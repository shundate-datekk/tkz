import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export interface UseSessionManagementOptions {
  /**
   * セッション期限切れ時に自動的にログインページにリダイレクトするか
   * @default false
   */
  redirectOnExpire?: boolean;
  /**
   * セッション期限切れ時に呼び出されるコールバック
   */
  onSessionExpire?: () => void;
}

export interface UseSessionManagementReturn {
  /**
   * ユーザーが認証されているか
   */
  isAuthenticated: boolean;
  /**
   * セッションが期限切れになったか（以前は認証されていたが現在は未認証）
   */
  isSessionExpired: boolean;
  /**
   * セッションが有効かどうかをチェックする
   */
  isSessionValid: () => boolean;
  /**
   * ログイン後に復帰すべきURLを取得する
   */
  getReturnUrl: () => string;
  /**
   * 保存されたreturnUrlをクリアする
   */
  clearReturnUrl: () => void;
}

const RETURN_URL_KEY = 'returnUrl';
const PUBLIC_PATHS = ['/login', '/auth'];

/**
 * パスが公開ページかどうかをチェックする
 */
const isPublicPath = (pathname: string): boolean => {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
};

/**
 * returnUrlを保存すべきかどうかをチェックする
 */
const shouldSaveReturnUrl = (pathname: string): boolean => {
  return !isPublicPath(pathname) && pathname !== '/';
};

/**
 * セッション管理とセッション期限切れの検出を行うHook
 *
 * @param options - オプション設定
 * @returns セッション状態と操作関数
 *
 * Requirements: 2.2, 2.3
 */
export function useSessionManagement(
  options?: UseSessionManagementOptions
): UseSessionManagementReturn {
  const { redirectOnExpire = false, onSessionExpire } = options || {};
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const wasAuthenticatedRef = useRef(false);

  const isAuthenticated = status === 'authenticated';

  // セッション状態の追跡
  useEffect(() => {
    if (status === 'authenticated') {
      wasAuthenticatedRef.current = true;
      setIsSessionExpired(false);
    } else if (status === 'unauthenticated' && wasAuthenticatedRef.current) {
      // 以前は認証されていたが現在は未認証 = セッション期限切れ
      setIsSessionExpired(true);

      // 現在のURLを保存（公開ページ以外）
      if (shouldSaveReturnUrl(pathname)) {
        localStorage.setItem(RETURN_URL_KEY, pathname);
      }

      // コールバックを呼び出す
      if (onSessionExpire) {
        onSessionExpire();
      }

      // リダイレクトが有効な場合
      if (redirectOnExpire) {
        router.push('/login');
      }
    }
  }, [status, pathname, router, redirectOnExpire, onSessionExpire]);

  /**
   * セッションが有効かどうかをチェックする
   */
  const isSessionValid = useCallback((): boolean => {
    return status === 'authenticated';
  }, [status]);

  /**
   * ログイン後に復帰すべきURLを取得する
   */
  const getReturnUrl = useCallback((): string => {
    if (typeof window === 'undefined') return '/';
    return localStorage.getItem(RETURN_URL_KEY) || '/';
  }, []);

  /**
   * 保存されたreturnUrlをクリアする
   */
  const clearReturnUrl = useCallback((): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(RETURN_URL_KEY);
  }, []);

  return {
    isAuthenticated,
    isSessionExpired,
    isSessionValid,
    getReturnUrl,
    clearReturnUrl,
  };
}
