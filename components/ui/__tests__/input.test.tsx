import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../input';
import { Label } from '../label';

/**
 * Inputコンポーネントのテスト
 *
 * ラベル表示、プレースホルダースタイル、
 * フォーカスフィードバックを検証します。
 *
 * Requirements: 5.7
 */
describe('Input', () => {
  describe('Placeholder Styles', () => {
    it('should have muted placeholder color', () => {
      render(<Input placeholder="Enter text" data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('placeholder:text-muted-foreground');
    });
  });

  describe('Focus Feedback', () => {
    it('should have focus ring', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('focus-visible:ring-2');
    });

    it('should have primary focus ring color', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('focus-visible:ring-primary');
    });

    it('should have ring offset', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('focus-visible:ring-offset-2');
    });

    it('should have outline-none on focus', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('focus-visible:outline-none');
    });
  });

  describe('Label Integration', () => {
    it('should work with label component', () => {
      render(
        <div>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" data-testid="input" />
        </div>
      );

      const label = screen.getByText('Test Label');
      const input = screen.getByTestId('input');

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });
  });

  describe('Disabled State', () => {
    it('should have disabled cursor', () => {
      render(<Input disabled data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should have reduced opacity when disabled', () => {
      render(<Input disabled data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Visual Styles', () => {
    it('should have border', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border');
    });

    it('should have rounded corners', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('rounded-md');
    });

    it('should have shadow', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('shadow-sm');
    });

    it('should have transition-colors', () => {
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input');
      expect(input).toHaveClass('transition-colors');
    });
  });
});
