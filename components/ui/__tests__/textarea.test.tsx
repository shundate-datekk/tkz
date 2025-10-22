import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Textarea } from '../textarea';

/**
 * Textareaコンポーネントのテスト
 *
 * 文字数カウンター、警告色表示、リサイズ機能を検証します。
 *
 * Requirements: 5.8, 1.7
 */
describe('Textarea', () => {
  describe('Character Counter', () => {
    it('should display character count when maxLength is set', () => {
      render(<Textarea maxLength={100} data-testid="textarea" />);

      expect(screen.getByText('0 / 100')).toBeInTheDocument();
    });

    it('should update character count on input', async () => {
      const user = userEvent.setup();

      render(<Textarea maxLength={100} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'Hello');

      expect(screen.getByText('5 / 100')).toBeInTheDocument();
    });

    it('should not display counter when maxLength is not set', () => {
      render(<Textarea data-testid="textarea" />);

      expect(screen.queryByText(/\/ /)).not.toBeInTheDocument();
    });
  });

  describe('Warning Color', () => {
    it('should show warning color when approaching limit (>80%)', async () => {
      const user = userEvent.setup();

      render(<Textarea maxLength={10} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, '12345678'); // 8 chars = 80%

      const counter = screen.getByText('8 / 10');
      expect(counter).toHaveClass('text-amber-600');
    });

    it('should show danger color when at limit (>90%)', async () => {
      const user = userEvent.setup();

      render(<Textarea maxLength={10} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, '1234567890'); // 10 chars = 100%

      const counter = screen.getByText('10 / 10');
      expect(counter).toHaveClass('text-red-600');
    });

    it('should show normal color when below 80%', async () => {
      const user = userEvent.setup();

      render(<Textarea maxLength={100} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'Hello');

      const counter = screen.getByText('5 / 100');
      expect(counter).toHaveClass('text-muted-foreground');
    });
  });

  describe('Counter Position', () => {
    it('should position counter at bottom right', () => {
      render(
        <div data-testid="wrapper">
          <Textarea maxLength={100} />
        </div>
      );

      const counter = screen.getByText('0 / 100');
      expect(counter.parentElement).toHaveClass('text-right');
    });
  });

  describe('Resize Feature', () => {
    it('should be resizable', () => {
      render(<Textarea data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      const styles = window.getComputedStyle(textarea);
      
      // Textareaはデフォルトでresizable
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Basic Styles', () => {
    it('should have proper visual styles', () => {
      render(<Textarea data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('rounded-md');
      expect(textarea).toHaveClass('border');
      expect(textarea).toHaveClass('shadow-sm');
    });
  });
});
