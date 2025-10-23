import { describe, it, expect } from 'vitest';

/**
 * Service Worker設定のテスト
 * 
 * Requirements: 14.6
 * PWA対応のためのService Worker設定を検証します。
 */

describe('Service Worker Configuration', () => {
  it('should have @serwist/next installed', async () => {
    const packageJson = await import('../../package.json');
    expect(packageJson.dependencies).toHaveProperty('@serwist/next');
    expect(packageJson.dependencies).toHaveProperty('@serwist/webpack-plugin');
  });

  it('should have next.config.ts with Serwist configuration', async () => {
    // next.config.tsの存在確認
    const fs = await import('fs/promises');
    const configExists = await fs
      .access('next.config.ts')
      .then(() => true)
      .catch(() => false);
    
    expect(configExists).toBe(true);

    // 設定内容の確認
    const configContent = await fs.readFile('next.config.ts', 'utf-8');
    expect(configContent).toContain('@serwist/next');
    expect(configContent).toContain('swSrc');
    expect(configContent).toContain('swDest');
    expect(configContent).toContain('cacheOnNavigation');
  });

  it('should have Service Worker source file (app/sw.ts)', async () => {
    const fs = await import('fs/promises');
    const swExists = await fs
      .access('app/sw.ts')
      .then(() => true)
      .catch(() => false);
    
    expect(swExists).toBe(true);

    // Service Worker内容の確認
    const swContent = await fs.readFile('app/sw.ts', 'utf-8');
    expect(swContent).toContain('Serwist');
    expect(swContent).toContain('precacheEntries');
    expect(swContent).toContain('runtimeCaching');
    expect(swContent).toContain('skipWaiting');
    expect(swContent).toContain('clientsClaim');
  });

  it('should have runtime caching strategies defined', async () => {
    const fs = await import('fs/promises');
    const swContent = await fs.readFile('app/sw.ts', 'utf-8');
    
    // NetworkFirst strategy (デフォルトキャッシュに含まれる)
    expect(swContent).toContain('NetworkFirst');
    
    // CacheFirst strategy (デフォルトキャッシュに含まれる)
    expect(swContent).toContain('CacheFirst');
    
    // StaleWhileRevalidate strategy
    expect(swContent).toContain('StaleWhileRevalidate');
    
    // デフォルトキャッシュの使用
    expect(swContent).toContain('defaultCache');
  });

  it('should have precache options configured', async () => {
    const fs = await import('fs/promises');
    const swContent = await fs.readFile('app/sw.ts', 'utf-8');
    
    expect(swContent).toContain('precacheOptions');
    expect(swContent).toContain('cleanupOutdatedCaches');
    expect(swContent).toContain('concurrency');
    expect(swContent).toContain('ignoreURLParametersMatching');
  });

  it('should enable immediate activation (skipWaiting and clientsClaim)', async () => {
    const fs = await import('fs/promises');
    const swContent = await fs.readFile('app/sw.ts', 'utf-8');
    
    expect(swContent).toContain('skipWaiting: true');
    expect(swContent).toContain('clientsClaim: true');
  });

  it('should have navigation preload enabled', async () => {
    const fs = await import('fs/promises');
    const swContent = await fs.readFile('app/sw.ts', 'utf-8');
    
    expect(swContent).toContain('navigationPreload: true');
  });

  it('should disable service worker in development', async () => {
    const fs = await import('fs/promises');
    const configContent = await fs.readFile('next.config.ts', 'utf-8');
    
    expect(configContent).toContain('disable: process.env.NODE_ENV === "development"');
  });

  it('should have manifest.json for PWA', async () => {
    const fs = await import('fs/promises');
    const manifestExists = await fs
      .access('public/manifest.json')
      .then(() => true)
      .catch(() => false);
    
    expect(manifestExists).toBe(true);

    // マニフェスト内容の確認
    const manifestContent = await fs.readFile('public/manifest.json', 'utf-8');
    const manifest = JSON.parse(manifestContent);
    
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('icons');
    expect(manifest).toHaveProperty('theme_color');
    expect(manifest).toHaveProperty('background_color');
    expect(manifest).toHaveProperty('display');
    expect(manifest).toHaveProperty('start_url');
  });

  it('should configure reload on online', async () => {
    const fs = await import('fs/promises');
    const configContent = await fs.readFile('next.config.ts', 'utf-8');
    
    expect(configContent).toContain('reloadOnOnline: true');
  });
});
