import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimationProvider, useAnimation } from '../animation-provider';
import { motion } from 'motion/react';

/**
 * AnimationProviderのテスト
 *
 * このテストは、prefers-reduced-motion対応、
 * アニメーション設定の提供を検証します。
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

// テスト用コンポーネント
function TestComponent() {
  const { shouldReduceMotion, transitionConfig } = useAnimation();

  return (
    <div>
      <div data-testid="reduce-motion">{shouldReduceMotion ? 'true' : 'false'}</div>
      <div data-testid="transition-duration">{transitionConfig.duration}</div>
      <motion.div
        data-testid="animated-box"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transitionConfig}
      >
        Animated Content
      </motion.div>
    </div>
  );
}

describe('AnimationProvider', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    // matchMedia をモック
    matchMediaMock = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  describe('Reduced Motion Detection', () => {
    it('should detect prefers-reduced-motion', () => {
      matchMediaMock.mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('reduce-motion')).toHaveTextContent('true');
    });

    it('should not reduce motion when user prefers motion', () => {
      matchMediaMock.mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('reduce-motion')).toHaveTextContent('false');
    });
  });

  describe('Transition Configuration', () => {
    it('should provide zero duration when motion is reduced', () => {
      matchMediaMock.mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('transition-duration')).toHaveTextContent('0');
    });

    it('should provide normal duration when motion is not reduced', () => {
      matchMediaMock.mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('transition-duration')).toHaveTextContent('0.3');
    });
  });

  describe('Motion Component Rendering', () => {
    it('should render motion components correctly', () => {
      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('animated-box')).toBeInTheDocument();
      expect(screen.getByText('Animated Content')).toBeInTheDocument();
    });
  });

  describe('Hook Usage Outside Provider', () => {
    it('should throw error when useAnimation is used outside AnimationProvider', () => {
      // エラーをキャッチするためにコンソールエラーを抑制
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAnimation must be used within AnimationProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('System Preference Changes', () => {
    it('should listen to reduced motion preference changes', () => {
      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      // addEventListener が呼ばれたことを確認
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });
  });
});
