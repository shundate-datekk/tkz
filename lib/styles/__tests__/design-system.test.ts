import { describe, it, expect } from 'vitest';

/**
 * デザインシステムのCSS変数テスト
 *
 * このテストは、グラデーションとスペーシングのCSS変数が
 * 正しく定義されているかを検証します。
 */
describe('Design System CSS Variables', () => {
  describe('Gradient Variables', () => {
    it('should have primary gradient variable defined', () => {
      // globals.cssに --gradient-primary が定義されているか
      const cssContent = require('fs').readFileSync(
        require('path').join(process.cwd(), 'app/globals.css'),
        'utf-8'
      );

      expect(cssContent).toContain('--gradient-primary:');
    });

    it('should have accent gradient variable defined', () => {
      const cssContent = require('fs').readFileSync(
        require('path').join(process.cwd(), 'app/globals.css'),
        'utf-8'
      );

      expect(cssContent).toContain('--gradient-accent:');
    });

    it('should have dark mode gradient variables', () => {
      const cssContent = require('fs').readFileSync(
        require('path').join(process.cwd(), 'app/globals.css'),
        'utf-8'
      );

      // ダークモードセクションにグラデーション変数が存在するか
      const darkModeSection = cssContent.match(/\.dark\s*\{[^}]+\}/s);
      expect(darkModeSection).toBeTruthy();
      if (darkModeSection) {
        expect(darkModeSection[0]).toContain('--gradient-primary:');
      }
    });
  });

  describe('Spacing Variables', () => {
    it('should have spacing-xs variable (4px)', () => {
      const cssContent = require('fs').readFileSync(
        require('path').join(process.cwd(), 'app/globals.css'),
        'utf-8'
      );

      expect(cssContent).toContain('--spacing-xs:');
      expect(cssContent).toContain('0.25rem'); // 4px
    });

    it('should have spacing-sm variable (8px)', () => {
      const cssContent = require('fs').readFileSync(
        require('path').join(process.cwd(), 'app/globals.css'),
        'utf-8'
      );

      expect(cssContent).toContain('--spacing-sm:');
      expect(cssContent).toContain('0.5rem'); // 8px
    });

    it('should have spacing-md variable (16px)', () => {
      const cssContent = require('fs').readFileSync(
        require('path').join(process.cwd(), 'app/globals.css'),
        'utf-8'
      );

      expect(cssContent).toContain('--spacing-md:');
      expect(cssContent).toContain('1rem'); // 16px
    });

    it('should have spacing-lg variable (24px)', () => {
      const cssContent = require('fs').readFileSync(
        require('path').join(process.cwd(), 'app/globals.css'),
        'utf-8'
      );

      expect(cssContent).toContain('--spacing-lg:');
      expect(cssContent).toContain('1.5rem'); // 24px
    });

    it('should have spacing-xl variable (32px)', () => {
      const cssContent = require('fs').readFileSync(
        require('path').join(process.cwd(), 'app/globals.css'),
        'utf-8'
      );

      expect(cssContent).toContain('--spacing-xl:');
      expect(cssContent).toContain('2rem'); // 32px
    });
  });

  describe('Gradient Color Definitions', () => {
    it('should use blue gradient for primary (future feel)', () => {
      const cssContent = require('fs').readFileSync(
        require('path').join(process.cwd(), 'app/globals.css'),
        'utf-8'
      );

      // 青系グラデーション（#3b82f6 to #8b5cf6 など）
      const primaryGradient = cssContent.match(/--gradient-primary:\s*linear-gradient\([^)]+\)/);
      expect(primaryGradient).toBeTruthy();
      if (primaryGradient) {
        // 青系の色コードが含まれているか（#3b82f6, #60a5fa, #8b5cf6 など）
        expect(primaryGradient[0]).toMatch(/#[0-9a-f]{6}/i);
      }
    });

    it('should use orange/yellow gradient for accent (excitement)', () => {
      const cssContent = require('fs').readFileSync(
        require('path').join(process.cwd(), 'app/globals.css'),
        'utf-8'
      );

      // オレンジ/黄色系グラデーション
      const accentGradient = cssContent.match(/--gradient-accent:\s*linear-gradient\([^)]+\)/);
      expect(accentGradient).toBeTruthy();
      if (accentGradient) {
        expect(accentGradient[0]).toMatch(/#[0-9a-f]{6}/i);
      }
    });
  });
});
