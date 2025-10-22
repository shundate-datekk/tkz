import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { 
  Serwist,
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from 'serwist';

/**
 * Service Worker設定
 *
 * PWA対応のためのService Worker設定です。
 * キャッシュ戦略を定義し、オフライン対応を実現します。
 *
 * Requirements: 14.6
 */

// Serwistグローバル設定の型拡張
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

/**
 * Service Workerインスタンスを作成
 */
const serwist = new Serwist({
  // プリキャッシュするリソースのマニフェスト
  precacheEntries: self.__SW_MANIFEST,
  
  // プリキャッシュ時のオプション
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 10,
    ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  },
  
  // スキップ待機（即座に有効化）
  skipWaiting: true,
  
  // クライアントをすぐに制御
  clientsClaim: true,
  
  // ナビゲーションプリロード
  navigationPreload: true,
  
  // デフォルトのキャッシング戦略を使用
  // defaultCacheには画像、フォント、静的アセットの最適なキャッシング戦略が含まれています
  runtimeCaching: defaultCache,
});

/**
 * Service Workerイベントリスナー
 */
serwist.addEventListeners();
