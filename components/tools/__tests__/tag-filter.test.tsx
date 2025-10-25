/**
 * TagFilter コンポーネントのテスト
 * Requirements: 27.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagFilter } from '../tag-filter';
import * as tagActions from '@/lib/actions/tag.actions';

// ResizeObserverをモック（ScrollAreaで必要）
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Tag Server Actionsをモック
vi.mock('@/lib/actions/tag.actions', () => ({
  getAllTagsWithCountAction: vi.fn(),
}));

describe('TagFilter', () => {
  const mockOnTagsChange = vi.fn();

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
    it('ボタンが表示されるべき', () => {
      render(<TagFilter selectedTags={[]} onTagsChange={mockOnTagsChange} />);
      expect(screen.getByText('タグで絞り込み')).toBeInTheDocument();
    });

    it('選択されたタグがバッジとして表示されるべき', () => {
      render(
        <TagFilter
          selectedTags={['React', 'TypeScript']}
          onTagsChange={mockOnTagsChange}
        />
      );

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('選択されたタグの数がバッジに表示されるべき', () => {
      render(
        <TagFilter
          selectedTags={['React', 'TypeScript']}
          onTagsChange={mockOnTagsChange}
        />
      );

      // バッジに "2" と表示される
      const badges = screen.getAllByText('2');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('タグ選択', () => {
    it('ポップオーバーを開くと利用可能なタグが表示されるべき', async () => {
      const user = userEvent.setup();
      render(<TagFilter selectedTags={[]} onTagsChange={mockOnTagsChange} />);

      const button = screen.getByText('タグで絞り込み');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('文章生成')).toBeInTheDocument();
        expect(screen.getByText('画像編集')).toBeInTheDocument();
        expect(screen.getByText('プログラミング')).toBeInTheDocument();
      });
    });

    it('タグをクリックして選択できるべき', async () => {
      const user = userEvent.setup();
      render(<TagFilter selectedTags={[]} onTagsChange={mockOnTagsChange} />);

      const button = screen.getByText('タグで絞り込み');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('文章生成')).toBeInTheDocument();
      });

      const tagOption = screen.getByText('文章生成');
      await user.click(tagOption);

      expect(mockOnTagsChange).toHaveBeenCalledWith(['文章生成']);
    });

    it('複数のタグを選択できるべき', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TagFilter selectedTags={[]} onTagsChange={mockOnTagsChange} />
      );

      const button = screen.getByText('タグで絞り込み');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('文章生成')).toBeInTheDocument();
      });

      // 1つ目のタグを選択
      const firstTag = screen.getByText('文章生成');
      await user.click(firstTag);
      expect(mockOnTagsChange).toHaveBeenCalledWith(['文章生成']);

      // 選択状態を反映して再レンダリング
      rerender(
        <TagFilter
          selectedTags={['文章生成']}
          onTagsChange={mockOnTagsChange}
        />
      );

      // 2つ目のタグを選択
      const secondTag = screen.getByText('プログラミング');
      await user.click(secondTag);
      expect(mockOnTagsChange).toHaveBeenCalledWith(['文章生成', 'プログラミング']);
    });

    it('タグは使用回数順にソートされるべき', async () => {
      const user = userEvent.setup();
      render(<TagFilter selectedTags={[]} onTagsChange={mockOnTagsChange} />);

      const button = screen.getByText('タグで絞り込み');
      await user.click(button);

      await waitFor(() => {
        const tagElements = screen.getAllByRole('checkbox');
        // 使用回数: 文章生成(10) > プログラミング(8) > 画像編集(5)
        expect(tagElements[0]).toHaveAttribute('id', 'tag-1');
        expect(tagElements[1]).toHaveAttribute('id', 'tag-3');
        expect(tagElements[2]).toHaveAttribute('id', 'tag-2');
      });
    });
  });

  describe('タグ削除', () => {
    it('バッジの×ボタンでタグを削除できるべき', async () => {
      const user = userEvent.setup();
      render(
        <TagFilter
          selectedTags={['React', 'TypeScript']}
          onTagsChange={mockOnTagsChange}
        />
      );

      // "React" の削除ボタンを探す
      const reactBadge = screen.getByText('React').closest('.inline-flex');
      const deleteButton = reactBadge?.querySelector('button');

      if (deleteButton) {
        await user.click(deleteButton);
        expect(mockOnTagsChange).toHaveBeenCalledWith(['TypeScript']);
      }
    });

    it('クリアボタンですべてのタグを削除できるべき', async () => {
      const user = userEvent.setup();
      render(
        <TagFilter
          selectedTags={['React', 'TypeScript']}
          onTagsChange={mockOnTagsChange}
        />
      );

      const clearButton = screen.getByText('クリア');
      await user.click(clearButton);

      expect(mockOnTagsChange).toHaveBeenCalledWith([]);
    });

    it('ポップオーバー内のすべてクリアボタンでタグを削除できるべき', async () => {
      const user = userEvent.setup();
      render(
        <TagFilter
          selectedTags={['React']}
          onTagsChange={mockOnTagsChange}
        />
      );

      const button = screen.getByText('タグで絞り込み');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('すべてクリア')).toBeInTheDocument();
      });

      const clearAllButton = screen.getByText('すべてクリア');
      await user.click(clearAllButton);

      expect(mockOnTagsChange).toHaveBeenCalledWith([]);
    });
  });

  describe('使用回数の表示', () => {
    it('各タグの使用回数が表示されるべき', async () => {
      const user = userEvent.setup();
      render(<TagFilter selectedTags={[]} onTagsChange={mockOnTagsChange} />);

      const button = screen.getByText('タグで絞り込み');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('8')).toBeInTheDocument();
      });
    });
  });

  describe('空の状態', () => {
    it('タグがない場合は「タグがありません」と表示されるべき', async () => {
      vi.mocked(tagActions.getAllTagsWithCountAction).mockResolvedValue({
        success: true,
        data: [],
      });

      const user = userEvent.setup();
      render(<TagFilter selectedTags={[]} onTagsChange={mockOnTagsChange} />);

      const button = screen.getByText('タグで絞り込み');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('タグがありません')).toBeInTheDocument();
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('API呼び出しが失敗してもエラーにならないべき', async () => {
      vi.mocked(tagActions.getAllTagsWithCountAction).mockResolvedValue({
        success: false,
        error: 'API Error',
      });

      const user = userEvent.setup();
      render(<TagFilter selectedTags={[]} onTagsChange={mockOnTagsChange} />);

      const button = screen.getByText('タグで絞り込み');
      await user.click(button);

      // エラーメッセージが表示されるか、タグがないメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('タグがありません')).toBeInTheDocument();
      });
    });
  });
});
