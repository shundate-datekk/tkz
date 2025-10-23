import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../button';
import { Home } from 'lucide-react';

/**
 * Buttonコンポーネントのテスト
 * 
 * Requirements: 5.1, 5.2, 5.3, 8.2, 8.6
 */

describe('Button', () => {
  describe('基本的な表示', () => {
    it('should render with default variant', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('should render with primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-primary');
    });

    it('should render with accent variant', () => {
      render(<Button variant="accent">Accent</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-accent');
    });
  });

  describe('グラデーションスタイル (Requirement 5.1)', () => {
    it('should have gradient background for primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-primary');
      expect(button).toHaveClass('text-white');
    });

    it('should have gradient background for accent variant', () => {
      render(<Button variant="accent">Accent</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-accent');
      expect(button).toHaveClass('text-white');
    });

    it('should have shadow effect', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('shadow-lg');
    });

    it('should have hover shadow effect', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:shadow-xl');
    });
  });

  describe('サイズバリエーション (Requirement 5.3)', () => {
    it('should render small size (44px minimum)', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11'); // 44px
      expect(button).toHaveClass('px-4');
    });

    it('should render medium size (48px)', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12'); // 48px
      expect(button).toHaveClass('px-6');
    });

    it('should render large size (56px)', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-14'); // 56px
      expect(button).toHaveClass('px-8');
    });

    it('should have minimum touch target of 44px', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      const computedStyle = window.getComputedStyle(button);
      // h-11 = 2.75rem = 44px
      expect(button).toHaveClass('h-11');
    });
  });

  describe('アイコン＋テキスト併用 (Requirement 5.3)', () => {
    it('should render with icon and text', () => {
      render(
        <Button variant="primary">
          <Home />
          Home
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Home');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should have proper gap between icon and text', () => {
      render(
        <Button>
          <Home />
          Home
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('gap-2');
    });

    it('should style icons properly', () => {
      render(
        <Button>
          <Home data-testid="icon" />
          Home
        </Button>
      );
      const button = screen.getByRole('button');
      // SVGアイコンのスタイル確認
      expect(button).toHaveClass('[&_svg]:size-4');
      expect(button).toHaveClass('[&_svg]:shrink-0');
    });
  });

  describe('アニメーション効果 (Requirements 8.2, 8.6)', () => {
    it('should have animated prop', () => {
      render(<Button animated>Animated</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should not animate when disabled', () => {
      render(
        <Button animated disabled>
          Disabled
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // disabled時はmotion.buttonではなく通常のbuttonをレンダリング
    });

    it('should show loading state with spinner', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('disabled状態', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should be disabled when isLoading is true', () => {
      render(<Button isLoading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should have opacity-50 when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toHaveClass('disabled:opacity-50');
    });

    it('should not have pointer events when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toHaveClass(
        'disabled:pointer-events-none'
      );
    });
  });

  describe('フォーカス管理', () => {
    it('should have focus-visible outline', () => {
      render(<Button>Focus me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
      expect(button).toHaveClass('focus-visible:ring-ring');
    });

    it('should have focus ring offset', () => {
      render(<Button>Focus me</Button>);
      expect(screen.getByRole('button')).toHaveClass(
        'focus-visible:ring-offset-2'
      );
    });
  });

  describe('その他のバリアント', () => {
    it('should render destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
      expect(button).toHaveClass('bg-background');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('should render link variant', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('underline-offset-4');
    });
  });

  describe('アクセシビリティ', () => {
    it('should have role="button"', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should support custom aria-label', () => {
      render(<Button aria-label="Custom label">Click</Button>);
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });
  });
});
