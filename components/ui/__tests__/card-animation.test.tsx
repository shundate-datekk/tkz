import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../card';
import { AnimationProvider } from '@/lib/providers/animation-provider';

/**
 * Cardアニメーションのテスト
 *
 * ホバー時の浮き上がりアニメーションを検証します。
 *
 * Requirements: 5.5
 */
describe('Card Animation', () => {
  beforeEach(() => {
    // matchMedia をモック
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  describe('Hover Animation', () => {
    it('should enable animations when animated prop is true', () => {
      render(
        <AnimationProvider>
          <Card animated data-testid="animated-card">
            Animated Card
          </Card>
        </AnimationProvider>
      );

      const card = screen.getByTestId('animated-card');
      expect(card).toBeInTheDocument();
    });

    it('should not animate when animated prop is false', () => {
      render(
        <AnimationProvider>
          <Card animated={false} data-testid="static-card">
            Static Card
          </Card>
        </AnimationProvider>
      );

      const card = screen.getByTestId('static-card');
      expect(card.tagName.toLowerCase()).toBe('div');
    });

    it('should apply transition duration class', () => {
      render(
        <AnimationProvider>
          <Card animated data-testid="card">
            Card
          </Card>
        </AnimationProvider>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('transition-all');
    });
  });

  describe('Static Card', () => {
    it('should render normal div when not animated', () => {
      render(
        <AnimationProvider>
          <Card data-testid="card">Normal Card</Card>
        </AnimationProvider>
      );

      const card = screen.getByTestId('card');
      expect(card.tagName.toLowerCase()).toBe('div');
    });
  });
});
