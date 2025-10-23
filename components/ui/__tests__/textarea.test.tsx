import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Textarea } from '../textarea';

/**
 * Textareaコンポーネントのテスト
 * 
 * Requirements: 5.8, 1.7
 */

describe('Textarea Component', () => {
  describe('基本スタイル', () => {
    it('should render textarea element', () => {
      render(<Textarea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toBeInTheDocument();
    });

    it('should have minimum height (min-h-[60px])', () => {
      render(<Textarea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass('min-h-[60px]');
    });

    it('should be full width', () => {
      render(<Textarea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass('w-full');
    });

    it('should have rounded corners', () => {
      render(<Textarea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass('rounded-md');
    });

    it('should have border', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('border');
      expect(textarea).toHaveClass('border-input');
    });

    it('should have shadow', () => {
      render(<Textarea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass('shadow-sm');
    });

    it('should have proper padding', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('px-3');
      expect(textarea).toHaveClass('py-2');
    });
  });

  describe('リアルタイム文字数カウンター (Requirements 5.8, 1.7)', () => {
    it('should show character counter when maxLength is set', () => {
      render(<Textarea maxLength={100} data-testid="textarea" />);
      expect(screen.getByText('0 / 100')).toBeInTheDocument();
    });

    it('should not show character counter when maxLength is not set', () => {
      render(<Textarea data-testid="textarea" />);
      expect(screen.queryByText(/\/ /)).not.toBeInTheDocument();
    });

    it('should update character count on typing', async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={100} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'Hello');

      expect(screen.getByText('5 / 100')).toBeInTheDocument();
    });

    it('should update character count with initial value', () => {
      render(<Textarea maxLength={100} defaultValue="Initial text" />);
      expect(screen.getByText('12 / 100')).toBeInTheDocument();
    });

    it('should update character count with controlled value', () => {
      const { rerender } = render(
        <Textarea maxLength={100} value="Test" onChange={() => {}} />
      );
      expect(screen.getByText('4 / 100')).toBeInTheDocument();

      rerender(<Textarea maxLength={100} value="Testing" onChange={() => {}} />);
      expect(screen.getByText('7 / 100')).toBeInTheDocument();
    });
  });

  describe('上限に近づいたら警告色で表示 (Requirement 5.8)', () => {
    it('should show normal color when below 80%', () => {
      render(<Textarea maxLength={100} defaultValue="Short text" />);
      const counter = screen.getByText(/10 \/ 100/);
      expect(counter).toHaveClass('text-muted-foreground');
    });

    it('should show amber color when 80-89% full', async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={10} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, '12345678'); // 8 characters = 80%

      const counter = screen.getByText('8 / 10');
      expect(counter).toHaveClass('text-amber-600');
    });

    it('should show red color when 90% or more', async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={10} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, '123456789'); // 9 characters = 90%

      const counter = screen.getByText('9 / 10');
      expect(counter).toHaveClass('text-red-600');
    });

    it('should show red color at 100% capacity', async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={5} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, '12345'); // 100%

      const counter = screen.getByText('5 / 5');
      expect(counter).toHaveClass('text-red-600');
    });
  });

  describe('リサイズ可能 (Requirement 5.8)', () => {
    it('should be resizable by default', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      // CSSのresizeプロパティはデフォルトで有効（明示的な制限なし）
      expect(textarea).not.toHaveClass('resize-none');
    });

    it('should support custom resize class', () => {
      render(<Textarea className="resize-vertical" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('resize-vertical');
    });
  });

  describe('右下に配置 (Requirement 5.8)', () => {
    it('should align counter to the right', () => {
      render(<Textarea maxLength={100} />);
      const counterContainer = screen.getByText(/\/ 100/).parentElement;
      expect(counterContainer).toHaveClass('text-right');
    });

    it('should have margin-top for spacing', () => {
      render(<Textarea maxLength={100} />);
      const counterContainer = screen.getByText(/\/ 100/).parentElement;
      expect(counterContainer).toHaveClass('mt-1');
    });

    it('should have small text size', () => {
      render(<Textarea maxLength={100} />);
      const counter = screen.getByText(/\/ 100/);
      expect(counter).toHaveClass('text-xs');
    });
  });

  describe('プレースホルダー', () => {
    it('should render placeholder', () => {
      render(
        <Textarea placeholder="Enter your message" data-testid="textarea" />
      );
      expect(screen.getByTestId('textarea')).toHaveAttribute(
        'placeholder',
        'Enter your message'
      );
    });

    it('should have muted-foreground color for placeholder', () => {
      render(<Textarea placeholder="Placeholder" data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass(
        'placeholder:text-muted-foreground'
      );
    });
  });

  describe('フォーカス時の視覚フィードバック', () => {
    it('should have focus-visible outline-none', () => {
      render(<Textarea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass(
        'focus-visible:outline-none'
      );
    });

    it('should have focus ring (2px)', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('focus-visible:ring-2');
      expect(textarea).toHaveClass('focus-visible:ring-primary');
    });

    it('should have focus ring offset', () => {
      render(<Textarea data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass(
        'focus-visible:ring-offset-2'
      );
    });
  });

  describe('disabled状態', () => {
    it('should be disabled when disabled prop is set', () => {
      render(<Textarea disabled data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toBeDisabled();
    });

    it('should have disabled styles', () => {
      render(<Textarea disabled data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('disabled:cursor-not-allowed');
      expect(textarea).toHaveClass('disabled:opacity-50');
    });

    it('should not update counter when disabled', async () => {
      const user = userEvent.setup();
      render(<Textarea disabled maxLength={100} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'test').catch(() => {
        // disabled なので入力できない
      });

      expect(screen.getByText('0 / 100')).toBeInTheDocument();
    });
  });

  describe('インタラクション', () => {
    it('should handle onChange event', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea');
      await user.type(textarea, 'test');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value on typing', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'hello world');

      expect(textarea.value).toBe('hello world');
    });

    it('should enforce maxLength', async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={5} data-testid="textarea" />);

      const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
      await user.type(textarea, '1234567890'); // Try to type 10 characters

      // maxLength should limit to 5 characters
      expect(textarea.value).toBe('12345');
      expect(screen.getByText('5 / 5')).toBeInTheDocument();
    });
  });

  describe('レスポンシブテキストサイズ', () => {
    it('should have responsive text size (base on mobile, sm on desktop)', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('text-base');
      expect(textarea).toHaveClass('md:text-sm');
    });
  });

  describe('アクセシビリティ', () => {
    it('should support aria-label', () => {
      render(<Textarea aria-label="Message" data-testid="textarea" />);
      expect(screen.getByLabelText('Message')).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <div>
          <Textarea aria-describedby="help-text" data-testid="textarea" />
          <span id="help-text">Help text</span>
        </div>
      );
      expect(screen.getByTestId('textarea')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('should support required attribute', () => {
      render(<Textarea required data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toBeRequired();
    });
  });

  describe('カスタマイズ', () => {
    it('should allow custom className', () => {
      render(<Textarea className="custom-class" data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('should support rows attribute', () => {
      render(<Textarea rows={5} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '5');
    });

    it('should support cols attribute', () => {
      render(<Textarea cols={50} data-testid="textarea" />);
      expect(screen.getByTestId('textarea')).toHaveAttribute('cols', '50');
    });
  });

  describe('ラッパーdiv', () => {
    it('should wrap textarea in a full-width div', () => {
      const { container } = render(<Textarea maxLength={100} />);
      const wrapper = container.querySelector('.w-full');
      expect(wrapper?.tagName).toBe('DIV');
    });
  });
});
