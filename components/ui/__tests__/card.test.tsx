import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card';

/**
 * Cardコンポーネントのテスト
 * 
 * Requirements: 5.4, 5.5
 */

describe('Card Components', () => {
  describe('統一された視覚スタイル (Requirement 5.4)', () => {
    it('should have 12px border radius (rounded-xl)', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-xl');
    });

    it('should have shadow', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('shadow-md');
    });

    it('should have border', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('border');
    });

    it('should have background color', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-card');
    });

    it('should have text color', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('text-card-foreground');
    });
  });

  describe('情報階層 (Requirement 5.4)', () => {
    it('should have proper header spacing', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('space-y-1.5');
      expect(header).toHaveClass('p-6');
    });

    it('should have title styling', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-xl');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('leading-none');
    });

    it('should have description styling', () => {
      render(<CardDescription data-testid="description">Description</CardDescription>);
      const description = screen.getByTestId('description');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('should have content padding', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6');
      expect(content).toHaveClass('pt-0');
    });

    it('should have footer styling', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('p-6');
      expect(footer).toHaveClass('pt-0');
    });
  });

  describe('ホバー時の浮き上がりアニメーション (Requirement 5.5)', () => {
    it('should have animated prop', () => {
      render(
        <Card animated data-testid="card">
          Animated Card
        </Card>
      );
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should have transition-all when animated', () => {
      render(
        <Card animated data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('transition-all');
    });

    it('should have 200ms duration when animated', () => {
      render(
        <Card animated data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('duration-200');
    });

    it('should not have transition classes when not animated', () => {
      render(
        <Card animated={false} data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('transition-all');
      expect(card).not.toHaveClass('duration-200');
    });
  });

  describe('複合的な使用例', () => {
    it('should render complete card structure', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Card Title</CardTitle>
            <CardDescription data-testid="description">
              Card Description
            </CardDescription>
          </CardHeader>
          <CardContent data-testid="content">Card Content</CardContent>
          <CardFooter data-testid="footer">Card Footer</CardFooter>
        </Card>
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toHaveTextContent('Card Title');
      expect(screen.getByTestId('description')).toHaveTextContent(
        'Card Description'
      );
      expect(screen.getByTestId('content')).toHaveTextContent('Card Content');
      expect(screen.getByTestId('footer')).toHaveTextContent('Card Footer');
    });

    it('should render animated card with all parts', () => {
      render(
        <Card animated data-testid="card">
          <CardHeader>
            <CardTitle>Animated Card</CardTitle>
            <CardDescription>With animation</CardDescription>
          </CardHeader>
          <CardContent>Content here</CardContent>
          <CardFooter>Footer here</CardFooter>
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('shadow-md');
      expect(card).toHaveClass('transition-all');
    });

    it('should allow custom className', () => {
      render(
        <Card data-testid="card" className="custom-class">
          Content
        </Card>
      );
      expect(screen.getByTestId('card')).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should support all HTML div attributes', () => {
      render(
        <Card
          data-testid="card"
          id="test-card"
          role="region"
          aria-label="Test Card"
        >
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('role', 'region');
      expect(card).toHaveAttribute('aria-label', 'Test Card');
    });
  });

  describe('レスポンシブ対応', () => {
    it('should maintain proper spacing on all viewport sizes', () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
      
      // p-6 はすべてのビューポートサイズで適用される
      const header = screen.getByText('Title').parentElement;
      expect(header).toHaveClass('p-6');
    });
  });

  describe('アクセシビリティ', () => {
    it('should be navigable', () => {
      render(
        <Card tabIndex={0} data-testid="card">
          Focusable Card
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should support ARIA attributes', () => {
      render(
        <Card
          data-testid="card"
          role="article"
          aria-labelledby="card-title"
        >
          <CardTitle id="card-title">Article Title</CardTitle>
          <CardContent>Article content</CardContent>
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'article');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
    });
  });
});
