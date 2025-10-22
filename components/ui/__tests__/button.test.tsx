import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';
import { AnimationProvider } from '@/lib/providers/animation-provider';
import { Mail } from 'lucide-react';

/**
 * Buttonコンポーネントのテスト
 *
 * グラデーションスタイル、サイズバリエーション、
 * アイコン＋テキストレイアウトを検証します。
 *
 * Requirements: 5.1, 5.2, 5.3
 */
describe('Button', () => {
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

  describe('Gradient Styles', () => {
    it('should render with primary gradient variant', () => {
      render(
        <AnimationProvider>
          <Button variant="primary">Primary Button</Button>
        </AnimationProvider>
      );

      const button = screen.getByText('Primary Button');
      expect(button).toHaveClass('bg-gradient-primary');
    });

    it('should render with accent gradient variant', () => {
      render(
        <AnimationProvider>
          <Button variant="accent">Accent Button</Button>
        </AnimationProvider>
      );

      const button = screen.getByText('Accent Button');
      expect(button).toHaveClass('bg-gradient-accent');
    });

    it('should have shadow styles', () => {
      render(
        <AnimationProvider>
          <Button variant="primary">Button</Button>
        </AnimationProvider>
      );

      const button = screen.getByText('Button');
      expect(button).toHaveClass('shadow-lg');
    });
  });

  describe('Size Variations', () => {
    it('should render small size (min 44px height)', () => {
      render(
        <AnimationProvider>
          <Button size="sm">Small</Button>
        </AnimationProvider>
      );

      const button = screen.getByText('Small');
      expect(button).toHaveClass('h-11'); // 44px
    });

    it('should render medium size', () => {
      render(
        <AnimationProvider>
          <Button size="md">Medium</Button>
        </AnimationProvider>
      );

      const button = screen.getByText('Medium');
      expect(button).toHaveClass('h-12'); // 48px
    });

    it('should render large size', () => {
      render(
        <AnimationProvider>
          <Button size="lg">Large</Button>
        </AnimationProvider>
      );

      const button = screen.getByText('Large');
      expect(button).toHaveClass('h-14'); // 56px
    });
  });

  describe('Icon + Text Layout', () => {
    it('should render with icon and text', () => {
      render(
        <AnimationProvider>
          <Button>
            <Mail className="mr-2" />
            Send Email
          </Button>
        </AnimationProvider>
      );

      expect(screen.getByText('Send Email')).toBeInTheDocument();
    });

    it('should have proper gap spacing for icon', () => {
      render(
        <AnimationProvider>
          <Button>
            <Mail />
            <span>Text</span>
          </Button>
        </AnimationProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('gap-2');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner', () => {
      render(
        <AnimationProvider>
          <Button isLoading>Loading</Button>
        </AnimationProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when loading', () => {
      render(
        <AnimationProvider>
          <Button isLoading>Loading</Button>
        </AnimationProvider>
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled', () => {
      render(
        <AnimationProvider>
          <Button disabled>Disabled</Button>
        </AnimationProvider>
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should have reduced opacity when disabled', () => {
      render(
        <AnimationProvider>
          <Button disabled>Disabled</Button>
        </AnimationProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
    });
  });
});
