import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';
import { AnimationProvider } from '@/lib/providers/animation-provider';

/**
 * Cardコンポーネントのテスト
 *
 * 統一された視覚スタイル（角丸、シャドウ、ボーダー）を検証します。
 *
 * Requirements: 5.4
 */
describe('Card', () => {
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

  describe('Visual Styles', () => {
    it('should have 12px border radius (rounded-xl)', () => {
      render(
        <AnimationProvider>
          <Card data-testid="card">Card Content</Card>
        </AnimationProvider>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-xl');
    });

    it('should have appropriate shadow', () => {
      render(
        <AnimationProvider>
          <Card data-testid="card">Card Content</Card>
        </AnimationProvider>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('shadow-md');
    });

    it('should have border', () => {
      render(
        <AnimationProvider>
          <Card data-testid="card">Card Content</Card>
        </AnimationProvider>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('border');
    });

    it('should have card background color', () => {
      render(
        <AnimationProvider>
          <Card data-testid="card">Card Content</Card>
        </AnimationProvider>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-card');
    });
  });

  describe('Information Hierarchy', () => {
    it('should render card header with proper spacing', () => {
      render(
        <AnimationProvider>
          <Card>
            <CardHeader data-testid="header">
              <CardTitle>Title</CardTitle>
            </CardHeader>
          </Card>
        </AnimationProvider>
      );

      const header = screen.getByTestId('header');
      expect(header).toHaveClass('p-6');
    });

    it('should render card title with proper typography', () => {
      render(
        <AnimationProvider>
          <Card>
            <CardHeader>
              <CardTitle data-testid="title">Card Title</CardTitle>
            </CardHeader>
          </Card>
        </AnimationProvider>
      );

      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-xl');
      expect(title).toHaveClass('font-semibold');
    });

    it('should render card description with muted color', () => {
      render(
        <AnimationProvider>
          <Card>
            <CardHeader>
              <CardDescription data-testid="desc">Description</CardDescription>
            </CardHeader>
          </Card>
        </AnimationProvider>
      );

      const desc = screen.getByTestId('desc');
      expect(desc).toHaveClass('text-muted-foreground');
    });

    it('should render card content with proper spacing', () => {
      render(
        <AnimationProvider>
          <Card>
            <CardContent data-testid="content">Content</CardContent>
          </Card>
        </AnimationProvider>
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6');
    });

    it('should render card footer with flex layout', () => {
      render(
        <AnimationProvider>
          <Card>
            <CardFooter data-testid="footer">Footer</CardFooter>
          </Card>
        </AnimationProvider>
      );

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
    });
  });

  describe('Composition', () => {
    it('should render complete card structure', () => {
      render(
        <AnimationProvider>
          <Card data-testid="card">
            <CardHeader>
              <CardTitle>Title</CardTitle>
              <CardDescription>Description</CardDescription>
            </CardHeader>
            <CardContent>Content</CardContent>
            <CardFooter>Footer</CardFooter>
          </Card>
        </AnimationProvider>
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});
