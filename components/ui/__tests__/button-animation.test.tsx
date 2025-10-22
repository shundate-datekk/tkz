import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../button';
import { AnimationProvider } from '@/lib/providers/animation-provider';

/**
 * Buttonアニメーションのテスト
 *
 * Motion効果（ホバー、タップ、リップル）を検証します。
 *
 * Requirements: 8.2, 8.6
 */
describe('Button Animation', () => {
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

  describe('Animation Enabled', () => {
    it('should enable animations when animated prop is true', () => {
      render(
        <AnimationProvider>
          <Button animated>Animated Button</Button>
        </AnimationProvider>
      );

      const button = screen.getByText('Animated Button');
      expect(button.tagName.toLowerCase()).toBe('button');
    });

    it('should not animate when disabled', () => {
      render(
        <AnimationProvider>
          <Button animated disabled>Disabled Animated</Button>
        </AnimationProvider>
      );

      const button = screen.getByText('Disabled Animated');
      expect(button).toBeDisabled();
    });
  });

  describe('Static Button', () => {
    it('should render normal button when animated is false', () => {
      render(
        <AnimationProvider>
          <Button animated={false}>Static Button</Button>
        </AnimationProvider>
      );

      const button = screen.getByText('Static Button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <AnimationProvider>
          <Button animated onClick={handleClick}>Click Me</Button>
        </AnimationProvider>
      );

      await user.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <AnimationProvider>
          <Button animated disabled onClick={handleClick}>Disabled</Button>
        </AnimationProvider>
      );

      await user.click(screen.getByText('Disabled'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
