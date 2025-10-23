import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Input } from '../input';
import { Label } from '../label';

/**
 * Inputコンポーネントのテスト
 * 
 * Requirements: 5.7
 */

describe('Input Component', () => {
  describe('基本スタイル', () => {
    it('should render input element', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('should have proper sizing (h-9)', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('h-9');
    });

    it('should be full width', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('w-full');
    });

    it('should have rounded corners', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('rounded-md');
    });

    it('should have border', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border');
      expect(input).toHaveClass('border-input');
    });

    it('should have shadow', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('shadow-sm');
    });

    it('should have proper padding', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('px-3');
      expect(input).toHaveClass('py-1');
    });

    it('should have transition-colors', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('transition-colors');
    });
  });

  describe('プレースホルダー (Requirement 5.7)', () => {
    it('should render placeholder', () => {
      render(<Input placeholder="Enter text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'placeholder',
        'Enter text'
      );
    });

    it('should have muted-foreground color for placeholder', () => {
      render(<Input placeholder="Placeholder" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'placeholder:text-muted-foreground'
      );
    });
  });

  describe('フォーカス時の視覚フィードバック (Requirement 5.7)', () => {
    it('should have focus-visible outline-none', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'focus-visible:outline-none'
      );
    });

    it('should have focus ring (2px)', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('focus-visible:ring-2');
      expect(input).toHaveClass('focus-visible:ring-primary');
    });

    it('should have focus ring offset', () => {
      render(<Input data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass(
        'focus-visible:ring-offset-2'
      );
    });
  });

  describe('ラベルとの併用 (Requirement 5.7)', () => {
    it('should work with Label component', () => {
      render(
        <div>
          <Label htmlFor="test-input">Label Text</Label>
          <Input id="test-input" />
        </div>
      );
      expect(screen.getByLabelText('Label Text')).toBeInTheDocument();
    });

    it('should maintain label-input association via htmlFor/id', () => {
      render(
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" />
        </div>
      );
      const input = screen.getByLabelText('Email Address');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('id', 'email');
    });

    it('should support always-visible label design', () => {
      render(
        <div>
          <Label htmlFor="username" data-testid="label">
            Username
          </Label>
          <Input id="username" placeholder="Enter username" />
        </div>
      );
      const label = screen.getByTestId('label');
      expect(label).toBeVisible();
      expect(label).toHaveTextContent('Username');
    });
  });

  describe('テキストサイズ', () => {
    it('should have responsive text size (base on mobile, sm on desktop)', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('text-base');
      expect(input).toHaveClass('md:text-sm');
    });
  });

  describe('disabled状態', () => {
    it('should be disabled when disabled prop is set', () => {
      render(<Input disabled data-testid="input" />);
      expect(screen.getByTestId('input')).toBeDisabled();
    });

    it('should have disabled styles', () => {
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveClass('disabled:opacity-50');
    });
  });

  describe('入力タイプ', () => {
    it('should support text type', () => {
      render(<Input type="text" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
    });

    it('should support email type', () => {
      render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
    });

    it('should support password type', () => {
      render(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
    });

    it('should support number type', () => {
      render(<Input type="number" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });

    it('should support url type', () => {
      render(<Input type="url" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'url');
    });

    it('should support tel type', () => {
      render(<Input type="tel" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'tel');
    });
  });

  describe('ファイル入力', () => {
    it('should support file type', () => {
      render(<Input type="file" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'file');
    });

    it('should have file input styles', () => {
      render(<Input type="file" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('file:border-0');
      expect(input).toHaveClass('file:bg-transparent');
      expect(input).toHaveClass('file:text-sm');
      expect(input).toHaveClass('file:font-medium');
    });
  });

  describe('インタラクション', () => {
    it('should handle onChange event', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value on typing', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="input" />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      await user.type(input, 'hello');

      expect(input.value).toBe('hello');
    });

    it('should handle onFocus event', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should handle onBlur event', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} data-testid="input" />);

      const input = screen.getByTestId('input');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Search" data-testid="input" />);
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="help-text" data-testid="input" />
          <span id="help-text">Help text</span>
        </div>
      );
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-describedby',
        'help-text'
      );
    });

    it('should support aria-invalid for validation', () => {
      render(<Input aria-invalid="true" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('should support required attribute', () => {
      render(<Input required data-testid="input" />);
      expect(screen.getByTestId('input')).toBeRequired();
    });
  });

  describe('カスタマイズ', () => {
    it('should allow custom className', () => {
      render(<Input className="custom-class" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should support all HTML input attributes', () => {
      render(
        <Input
          data-testid="input"
          name="test-name"
          maxLength={100}
          minLength={5}
          pattern="[A-Za-z]+"
        />
      );
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('name', 'test-name');
      expect(input).toHaveAttribute('maxLength', '100');
      expect(input).toHaveAttribute('minLength', '5');
      expect(input).toHaveAttribute('pattern', '[A-Za-z]+');
    });
  });

  describe('統一されたスタイル', () => {
    it('should have consistent styling with other form elements', () => {
      render(
        <div>
          <Input data-testid="input" placeholder="Input field" />
        </div>
      );
      const input = screen.getByTestId('input');
      
      // 一貫したスタイル要素
      expect(input).toHaveClass('rounded-md'); // 角丸
      expect(input).toHaveClass('border'); // ボーダー
      expect(input).toHaveClass('shadow-sm'); // シャドウ
      expect(input).toHaveClass('transition-colors'); // トランジション
      expect(input).toHaveClass('focus-visible:ring-2'); // フォーカスリング
    });
  });
});
