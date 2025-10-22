import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedButton } from '../animated-button';
import { AnimationProvider } from '@/lib/providers/animation-provider';

/**
 * AnimatedButtonのテスト
 *
 * このテストは、アニメーションボタンが正しくレンダリングされ、
 * 各バリアントが適用されることを検証します。
 */
describe('AnimatedButton', () => {
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
  it('should render with children', () => {
    render(
      <AnimationProvider>
        <AnimatedButton>Click me</AnimatedButton>
      </AnimationProvider>
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render with primary variant', () => {
    render(
      <AnimationProvider>
        <AnimatedButton variant="primary">Primary</AnimatedButton>
      </AnimationProvider>
    );

    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-gradient-primary');
  });

  it('should render with secondary variant', () => {
    render(
      <AnimationProvider>
        <AnimatedButton variant="secondary">Secondary</AnimatedButton>
      </AnimationProvider>
    );

    const button = screen.getByText('Secondary');
    expect(button).toHaveClass('bg-secondary');
  });

  it('should render with accent variant', () => {
    render(
      <AnimationProvider>
        <AnimatedButton variant="accent">Accent</AnimatedButton>
      </AnimationProvider>
    );

    const button = screen.getByText('Accent');
    expect(button).toHaveClass('bg-gradient-accent');
  });

  it('should apply custom className', () => {
    render(
      <AnimationProvider>
        <AnimatedButton className="custom-class">Custom</AnimatedButton>
      </AnimationProvider>
    );

    const button = screen.getByText('Custom');
    expect(button).toHaveClass('custom-class');
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <AnimationProvider>
        <AnimatedButton disabled>Disabled</AnimatedButton>
      </AnimationProvider>
    );

    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });
});
