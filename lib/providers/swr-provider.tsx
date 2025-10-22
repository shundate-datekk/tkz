'use client';

import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';

/**
 * SWRグローバル設定Provider
 *
 * データフェッチングのグローバル設定を提供します。
 * - dedupingInterval: 重複リクエストの排除（2秒）
 * - revalidateOnFocus: フォーカス時の再検証
 * - revalidateOnReconnect: 再接続時の再検証
 *
 * Requirements: 14.3
 */
export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        // 重複リクエストの排除（2秒以内の同じキーへのリクエストは1つにまとめる）
        dedupingInterval: 2000,
        
        // ウィンドウフォーカス時に再検証
        revalidateOnFocus: true,
        
        // ネットワーク再接続時に再検証
        revalidateOnReconnect: true,
        
        // エラー時の再試行設定
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        
        // デフォルトのfetcher（Server Actionsと互換性あり）
        // Server Actionは直接関数として渡せるため、
        // fetcher内では引数をそのまま実行するだけでOK
        fetcher: async (...args: any[]) => {
          const [key, action] = args;
          
          // actionが関数の場合はServer Actionとして実行
          if (typeof action === 'function') {
            return action(key);
          }
          
          // actionがない場合はkeyを直接実行（関数として）
          if (typeof key === 'function') {
            return key();
          }
          
          throw new Error('Invalid fetcher arguments');
        },
        
        // ローディング時のフォールバック
        suspense: false,
        
        // キャッシュの永続化（オプション）
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
}
