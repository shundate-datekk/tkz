'use client';

import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

/**
 * SWRProvider - SWRのグローバル設定を提供
 * 
 * 機能:
 * - グローバルエラーハンドリング
 * - デフォルトの再検証設定
 * - リクエストの重複排除（dedupe）
 * - フォーカス時の再検証
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // デフォルトのフェッチャー（オプション）
        // fetcher: (url: string) => fetch(url).then((res) => res.json()),
        
        // エラーハンドリング
        onError: (error) => {
          console.error('SWR Error:', error);
        },
        
        // 再検証設定
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateOnMount: true,
        
        // リクエストの重複排除
        dedupingInterval: 2000, // 2秒以内の重複リクエストを排除
        
        // エラーリトライ設定
        errorRetryCount: 3,
        errorRetryInterval: 5000, // 5秒
        
        // タイムアウト設定
        focusThrottleInterval: 5000, // フォーカス時の再検証を5秒に1回に制限
        
        // キャッシュ設定
        shouldRetryOnError: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
