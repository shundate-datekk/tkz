import { describe, it, expect } from 'vitest';
import config from '@/tailwind.config';

/**
 * Tailwind設定のデザイントークンテスト
 *
 * このテストは、CSS変数がTailwindで使えるように
 * 正しく設定されているかを検証します。
 */
describe('Tailwind Config Design Tokens', () => {
  describe('Background Image Extensions', () => {
    it('should have gradient-primary utility', () => {
      expect(config.theme?.extend).toBeDefined();
      const extend = config.theme?.extend as any;
      expect(extend.backgroundImage).toBeDefined();
      expect(extend.backgroundImage['gradient-primary']).toBe('var(--gradient-primary)');
    });

    it('should have gradient-accent utility', () => {
      const extend = config.theme?.extend as any;
      expect(extend.backgroundImage['gradient-accent']).toBe('var(--gradient-accent)');
    });
  });

  describe('Spacing Extensions', () => {
    it('should have xs spacing (4px)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.spacing).toBeDefined();
      expect(extend.spacing.xs).toBe('var(--spacing-xs)');
    });

    it('should have sm spacing (8px)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.spacing.sm).toBe('var(--spacing-sm)');
    });

    it('should have md spacing (16px)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.spacing.md).toBe('var(--spacing-md)');
    });

    it('should have lg spacing (24px)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.spacing.lg).toBe('var(--spacing-lg)');
    });

    it('should have xl spacing (32px)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.spacing.xl).toBe('var(--spacing-xl)');
    });
  });

  describe('Gap Extensions', () => {
    it('should have xs gap (4px)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.gap).toBeDefined();
      expect(extend.gap.xs).toBe('var(--spacing-xs)');
    });

    it('should have sm gap (8px)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.gap.sm).toBe('var(--spacing-sm)');
    });

    it('should have md gap (16px)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.gap.md).toBe('var(--spacing-md)');
    });

    it('should have lg gap (24px)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.gap.lg).toBe('var(--spacing-lg)');
    });

    it('should have xl gap (32px)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.gap.xl).toBe('var(--spacing-xl)');
    });
  });

  describe('Transition Duration Extensions', () => {
    it('should have fast transition (150ms)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.transitionDuration).toBeDefined();
      expect(extend.transitionDuration.fast).toBe('150ms');
    });

    it('should have normal transition (300ms)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.transitionDuration.normal).toBe('300ms');
    });

    it('should have slow transition (500ms)', () => {
      const extend = config.theme?.extend as any;
      expect(extend.transitionDuration.slow).toBe('500ms');
    });
  });
});
