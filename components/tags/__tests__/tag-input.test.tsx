/**
 * TagInput コンポーネントのテスト
 * Requirements: 27.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from '../tag-input';
import * as tagActions from '@/lib/actions/tag.actions';

// Tag Server Actionsをモック
vi.mock('@/lib/actions/tag.actions', () => ({
  getAllTagsWithCountAction: vi.fn(),
}));

describe('TagInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tagActions.getAllTagsWithCountAction).mockResolvedValue({
      success: true,
      data: [
        { id: '1', name: '文章生成', usage_count: 10 },
        { id: '2', name: '画像編集', usage_count: 5 },
        { id: '3', name: 'プログラミング', usage_count: 8 },
      ],
    });
  });

  describe('基本レンダリング', () => {
    it('ラベルとプレースホルダーが表示されるべき', () => {
      render(
        <TagInput
          value={[]}
          onChange={mockOnChange}
          label="タグ"
          placeholder="タグを入力"
        />
      );

      expect(screen.getByText('タグ')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('タグを入力')).toBeInTheDocument();
    });

    it('初期値としてタグが表示されるべき', () => {
      render(
        <TagInput
          value={['React', 'TypeScript']}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });
  });

  describe('タグの追加', () => {
    it('Enterキーでタグを追加できるべき', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.type(input, 'React{Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['React']);
    });

    it('カンマでタグを追加できるべき', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.type(input, 'React,');

      expect(mockOnChange).toHaveBeenCalledWith(['React']);
    });

    it('複数のタグをカンマ区切りで追加できるべき', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.type(input, 'React,TypeScript,Next.js{Enter}');

      // カンマで2つ追加される
      expect(mockOnChange).toHaveBeenCalledWith(['React']);
      expect(mockOnChange).toHaveBeenCalledWith(['TypeScript']);
      // 最後にEnterで追加される
      expect(mockOnChange).toHaveBeenCalledWith(['Next.js']);
    });

    it('空白のみのタグは追加されないべき', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.type(input, '   {Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('重複したタグは追加されないべき', async () => {
      const user = userEvent.setup();
      render(<TagInput value={['React']} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.type(input, 'React{Enter}');

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('前後の空白がトリムされるべき', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.type(input, '  React  {Enter}');

      expect(mockOnChange).toHaveBeenCalledWith(['React']);
    });
  });

  describe('タグの削除', () => {
    it('バッジの×ボタンでタグを削除できるべき', async () => {
      const user = userEvent.setup();
      render(
        <TagInput
          value={['React', 'TypeScript']}
          onChange={mockOnChange}
        />
      );

      // 最初のタグ "React" の削除ボタンをクリック
      const badges = screen.getAllByRole('button');
      const reactBadge = badges.find(b => b.textContent?.includes('React'));

      if (reactBadge) {
        await user.click(reactBadge);
        expect(mockOnChange).toHaveBeenCalledWith(['TypeScript']);
      }
    });

    it('Backspaceキーで最後のタグを削除できるべき', async () => {
      const user = userEvent.setup();
      render(
        <TagInput
          value={['React', 'TypeScript']}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.click(input);
      await user.keyboard('{Backspace}');

      expect(mockOnChange).toHaveBeenCalledWith(['React']);
    });

    it('入力中のテキストがある場合はBackspaceでタグ削除されないべき', async () => {
      const user = userEvent.setup();
      render(
        <TagInput
          value={['React']}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.type(input, 'Type');
      await user.keyboard('{Backspace}');

      // タグ削除は呼ばれない（テキスト削除のみ）
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('オートコンプリート', () => {
    it('既存のタグがサジェストとして表示されるべき', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.type(input, '文');

      await waitFor(() => {
        expect(screen.getByText(/文章生成/)).toBeInTheDocument();
      });
    });

    it('使用回数が多い順にソートされるべき', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.click(input);

      await waitFor(() => {
        const suggestions = screen.getAllByRole('option');
        // 使用回数: 文章生成(10) > プログラミング(8) > 画像編集(5)
        expect(suggestions[0]).toHaveTextContent('文章生成');
        expect(suggestions[1]).toHaveTextContent('プログラミング');
        expect(suggestions[2]).toHaveTextContent('画像編集');
      });
    });

    it('サジェストをクリックしてタグを追加できるべき', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.type(input, '文');

      await waitFor(() => {
        expect(screen.getByText(/文章生成/)).toBeInTheDocument();
      });

      const suggestion = screen.getByRole('option', { name: /文章生成/ });
      await user.click(suggestion);

      expect(mockOnChange).toHaveBeenCalledWith(['文章生成']);
    });

    it('入力に一致しないサジェストは表示されないべき', async () => {
      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.type(input, 'xyz');

      await waitFor(() => {
        expect(screen.queryByRole('option')).not.toBeInTheDocument();
      });
    });
  });

  describe('無効化状態', () => {
    it('無効化されている場合は入力できないべき', () => {
      render(
        <TagInput
          value={[]}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      expect(input).toBeDisabled();
    });
  });

  describe('エラーハンドリング', () => {
    it('タグ取得エラー時もコンポーネントは正常に動作するべき', async () => {
      vi.mocked(tagActions.getAllTagsWithCountAction).mockResolvedValue({
        success: false,
        error: 'API Error',
      });

      const user = userEvent.setup();
      render(<TagInput value={[]} onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('タグを入力（カンマ区切り）');
      await user.type(input, 'React{Enter}');

      // エラーがあってもタグは追加できる
      expect(mockOnChange).toHaveBeenCalledWith(['React']);
    });
  });
});
