import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolForm } from '../tool-form';

/**
 * ToolFormコンポーネントのテスト
 * 
 * モバイルで1カラム、デスクトップで2カラムのレスポンシブレイアウトを検証します。
 * 
 * Requirements: 1.1, 1.4, 1.6
 */
describe('ToolForm', () => {
  const mockSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('レスポンシブレイアウト (Task 6.1)', () => {
    it('should have space-y container for vertical spacing', () => {
      const { container } = render(
        <ToolForm onSubmit={mockSubmit} />
      );

      const form = container.querySelector('form');
      expect(form).toHaveClass('space-y-6');
    });

    it('should have responsive grid for fields on desktop', () => {
      const { container } = render(
        <ToolForm onSubmit={mockSubmit} />
      );

      // デスクトップで2カラムになる要素を確認
      const gridContainer = container.querySelector('.md\\:grid-cols-2');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should have full-width submit button', () => {
      render(<ToolForm onSubmit={mockSubmit} />);

      const submitButton = screen.getByRole('button', { name: /登録/i });
      expect(submitButton).toHaveClass('w-full');
    });
  });

  describe('フォームフィールド', () => {
    it('should render all required fields', () => {
      render(<ToolForm onSubmit={mockSubmit} />);

      expect(screen.getByLabelText(/ツール名/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/カテゴリ/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/使用目的/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/使用感/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/評価/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/使用日/i)).toBeInTheDocument();
    });

it('should display form fields with proper labels', () => {
      render(<ToolForm onSubmit={mockSubmit} />);

      // すべてのフィールドにラベルが存在することを確認（*付き）
      expect(screen.getByText('ツール名 *')).toBeInTheDocument();
      expect(screen.getByText('カテゴリ *')).toBeInTheDocument();
      expect(screen.getByText('使用目的 *')).toBeInTheDocument();
      expect(screen.getByText('使用感 *')).toBeInTheDocument();
      expect(screen.getByText('評価 *')).toBeInTheDocument();
      expect(screen.getByText('使用日 *')).toBeInTheDocument();
    });
  });

  describe('フォーカス管理とスクロール (Task 7.4)', () => {
    it('should have placeholder text for guidance', () => {
      render(<ToolForm onSubmit={mockSubmit} />);

      const toolNameInput = screen.getByPlaceholderText(/ChatGPT, Midjourney/i);
      expect(toolNameInput).toBeInTheDocument();
    });

    it('should have description text for help', () => {
      render(<ToolForm onSubmit={mockSubmit} />);

      expect(screen.getByText(/使用したAIツールの名前を入力してください/i)).toBeInTheDocument();
    });
  });
});
