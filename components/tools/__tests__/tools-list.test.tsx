import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolsList } from '../tools-list';
import type { AITool } from '@/lib/schemas/ai-tool.schema';

// useDebounce のモック
vi.mock('@/lib/hooks/use-debounce', () => ({
  useDebounce: (value: string) => value,
}));

// LikeButton のモック
vi.mock('@/components/tools/like-button', () => ({
  LikeButton: ({ toolId }: { toolId: string }) => (
    <button data-testid={`like-button-${toolId}`}>いいね</button>
  ),
}));

/**
 * ToolsListコンポーネントのテスト
 * 
 * カードグリッドのレスポンシブ対応（モバイル1列、タブレット2列、デスクトップ3列）を検証します。
 * 
 * Requirements: 1.2, 1.5, 5.7
 */
describe('ToolsList', () => {
  const mockTools: AITool[] = [
    {
      id: '1',
      tool_name: 'Test Tool 1',
      category: 'テキスト生成',
      usage_purpose: 'テスト目的1',
      user_experience: 'テスト使用感1',
      rating: 5,
      usage_date: '2024-01-01',
      created_by: 'user1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      tool_name: 'Test Tool 2',
      category: '画像生成',
      usage_purpose: 'テスト目的2',
      user_experience: 'テスト使用感2',
      rating: 4,
      usage_date: '2024-01-02',
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
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user1"
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
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user1"
        />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('gap-4');
    });

    it('should display all tools in grid', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user1"
        />
      );

      expect(screen.getByText('Test Tool 1')).toBeInTheDocument();
      expect(screen.getByText('Test Tool 2')).toBeInTheDocument();
    });
  });

  describe('空状態の表示 (Task 5.3)', () => {
    it('should show empty state when no tools', () => {
      render(
        <ToolsList
          tools={[]}
          userMap={mockUserMap}
          currentUserId="user1"
        />
      );

      expect(screen.getByText('まだツールが登録されていません')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /最初のツールを登録する/i })).toBeInTheDocument();
    });

    it('should show empty state with border-dashed', () => {
      const { container } = render(
        <ToolsList
          tools={[]}
          userMap={mockUserMap}
          currentUserId="user1"
        />
      );

      const emptyState = container.querySelector('.border-dashed');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveClass('rounded-lg');
    });
  });

  describe('コンテナとパディング (Task 5.1)', () => {
    it('should be wrapped in space-y container', () => {
      const { container } = render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user1"
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('space-y-6');
    });
  });
});
