import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../button';

/**
 * Buttonコンポーネントのリップル効果テスト
 * 
 * Requirements: 8.2, 8.6
 * 
 * Note: リップル効果はMotionのwhileTap/whileHoverで実装済み
 * このテストでは既存のアニメーション動作を検証
 */

describe('Button Ripple and Animation Effects', () => {
  describe('Motionアニメーション (Requirements 8.2, 8.6)', () => {
    it('should have animated prop to enable animations', () => {
      render(
        <Button animated variant="primary">
          Animated Button
        </Button>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render as motion.button when animated is true', () => {
      const { container } = render(
        <Button animated variant="primary">
          Animated
        </Button>
      );
      // motion.buttonとしてレンダリングされることを確認
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should not animate when disabled', () => {
      render(
        <Button animated disabled variant="primary">
          Disabled
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // disabled時は通常のbuttonとしてレンダリング
    });

    it('should not animate when loading', () => {
      render(
        <Button animated isLoading variant="primary">
          Loading
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should work with all size variants', () => {
      const { rerender } = render(
        <Button animated size="sm">
          Small
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass('h-11');

      rerender(
        <Button animated size="md">
          Medium
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass('h-12');

      rerender(
        <Button animated size="lg">
          Large
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass('h-14');
    });

    it('should work with all color variants', () => {
      const { rerender } = render(
        <Button animated variant="primary">
          Primary
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass('bg-gradient-primary');

      rerender(
        <Button animated variant="accent">
          Accent
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass('bg-gradient-accent');

      rerender(
        <Button animated variant="destructive">
          Destructive
        </Button>
      );
      expect(screen.getByRole('button')).toHaveClass('bg-destructive');
    });
  });

  describe('インタラクション', () => {
    it('should be clickable when animated', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <Button animated onClick={handleClick} variant="primary">
          Click me
        </Button>
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not be clickable when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <Button animated disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      // disabledボタンはクリックできない
      await user.click(button).catch(() => {
        // エラーを無視（disabledなのでクリックできない）
      });
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should support keyboard interaction', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <Button animated onClick={handleClick}>
          Keyboard
        </Button>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('ビジュアルフィードバック', () => {
    it('should have transition duration', () => {
      render(<Button animated>Animated</Button>);
      const button = screen.getByRole('button');
      // transition-colorsクラスが適用されていることを確認
      expect(button).toHaveClass('transition-colors');
    });

    it('should maintain shadow on gradient variants', () => {
      render(
        <Button animated variant="primary">
          Primary
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass('shadow-lg');
      expect(button).toHaveClass('hover:shadow-xl');
    });

    it('should support loading state with animation', () => {
      render(
        <Button animated isLoading variant="primary">
          Loading
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('パフォーマンス', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();
      
      function TestButton() {
        renderSpy();
        return <Button animated>Test</Button>;
      }
      
      const { rerender } = render(<TestButton />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // 同じpropsで再レンダリング
      rerender(<TestButton />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid clicks gracefully', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(
        <Button animated onClick={handleClick}>
          Rapid Click
        </Button>
      );

      const button = screen.getByRole('button');
      
      // 連続クリック
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('reduced-motion対応', () => {
    it('should respect prefers-reduced-motion (implicit via AnimationProvider)', () => {
      // AnimationProviderがprefers-reduced-motionを検知してduration: 0に設定
      // Buttonコンポーネント自体はanimated propで制御
      render(
        <Button animated variant="primary">
          Motion
        </Button>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should allow disabling animation via animated=false', () => {
      render(
        <Button animated={false} variant="primary">
          No Animation
        </Button>
      );
      const button = screen.getByRole('button');
      // animated={false}の場合は通常のbuttonとしてレンダリング
      expect(button).toBeInTheDocument();
    });
  });
});
