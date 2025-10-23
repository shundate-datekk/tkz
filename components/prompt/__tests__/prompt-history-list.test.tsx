import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PromptHistoryList } from '../prompt-history-list';
import type { PromptHistory } from '@/lib/schemas/prompt.schema';

// useDebounce のモック
vi.mock('@/lib/hooks/use-debounce', () => ({
  useDebounce: (value: string) => value,
}));

/**
 * PromptHistoryListコンポーネントのテスト
 * 
 * カードグリッドのレスポンシブ対応（モバイル1列、タブレット2列、デスクトップ3列）を検証します。
 * 
 * Requirements: 1.2, 1.5, 5.7
 */
describe('PromptHistoryList', () => {
  const mockHistories: PromptHistory[] = [
    {
      id: '1',
      prompt_text: 'Test prompt 1',
      input_parameters: {
        purpose: 'テスト目的1',
        sceneDescription: 'テストシーン1',
        style: 'テストスタイル1',
        additionalRequirements: '',
      },
      created_by: 'user1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      prompt_text: 'Test prompt 2',
      input_parameters: {
        purpose: 'テスト目的2',
        sceneDescription: 'テストシーン2',
        style: 'テストスタイル2',
        additionalRequirements: '',
      },
      created_by: 'user2',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  const mockUserMap = new Map([
    ['user1', 'ユーザー1'],
    ['user2', 'ユーザー2'],
  ]);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('レスポンシブグリッドレイアウト (Task 5.1)', () => {
    it('should have responsive grid classes', () => {
      const { container } = render(
        <PromptHistoryList
          histories={mockHistories}
          userMap={mockUserMap}
        />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      
      // モバイル: 1列（デフォルト）
      expect(grid).toHaveClass('grid-cols-1');
      
      // タブレット: 2列（md: 768px）
      expect(grid).toHaveClass('md:grid-cols-2');
      
      // デスクトップ: 3列（lg: 1024px）
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('should have consistent gap spacing', () => {
      const { container } = render(
        <PromptHistoryList
          histories={mockHistories}
          userMap={mockUserMap}
        />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-6');
    });

    it('should display all histories in grid', () => {
      render(
        <PromptHistoryList
          histories={mockHistories}
          userMap={mockUserMap}
        />
      );

      expect(screen.getByText('テスト目的1')).toBeInTheDocument();
      expect(screen.getByText('テスト目的2')).toBeInTheDocument();
    });
  });

  describe('空状態の表示 (Task 5.3)', () => {
    it('should show empty state when no histories', () => {
      render(
        <PromptHistoryList
          histories={[]}
          userMap={mockUserMap}
        />
      );

      expect(screen.getByText('まだプロンプトが保存されていません')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /プロンプトを生成する/i })).toBeInTheDocument();
    });

    it('should show empty state with border-dashed', () => {
      const { container } = render(
        <PromptHistoryList
          histories={[]}
          userMap={mockUserMap}
        />
      );

      const emptyState = container.querySelector('.border-dashed');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveClass('rounded-lg');
    });
  });

  describe('コンテナとスペーシング (Task 5.1)', () => {
    it('should be wrapped in space-y container', () => {
      const { container } = render(
        <PromptHistoryList
          histories={mockHistories}
          userMap={mockUserMap}
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('space-y-6');
    });
  });
});
