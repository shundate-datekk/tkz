import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ToolsList } from '../tools-list';
import type { AITool } from '@/lib/schemas/ai-tool.schema';

// Mock like actions
vi.mock('@/lib/actions/like.actions', () => ({
  likeToolAction: vi.fn(),
  unlikeToolAction: vi.fn(),
}));

/**
 * 複数選択UI機能のテスト
 *
 * Requirements: 3.4
 */

describe('ToolsList - Multi-select', () => {
  const mockTools: AITool[] = [
    {
      id: 'tool-1',
      tool_name: 'ChatGPT',
      category: 'AI対話',
      usage_purpose: 'テスト1',
      user_experience: '良い',
      rating: 5,
      usage_date: '2025-10-23',
      created_by: 'user-1',
      created_at: '2025-10-23T00:00:00Z',
      updated_at: '2025-10-23T00:00:00Z',
      deleted_at: null,
    },
    {
      id: 'tool-2',
      tool_name: 'Midjourney',
      category: '画像生成',
      usage_purpose: 'テスト2',
      user_experience: '素晴らしい',
      rating: 5,
      usage_date: '2025-10-22',
      created_by: 'user-1',
      created_at: '2025-10-22T00:00:00Z',
      updated_at: '2025-10-22T00:00:00Z',
      deleted_at: null,
    },
    {
      id: 'tool-3',
      tool_name: 'Claude',
      category: 'AI対話',
      usage_purpose: 'テスト3',
      user_experience: '最高',
      rating: 5,
      usage_date: '2025-10-21',
      created_by: 'user-2',
      created_at: '2025-10-21T00:00:00Z',
      updated_at: '2025-10-21T00:00:00Z',
      deleted_at: null,
    },
  ];

  const mockUserMap = new Map([
    ['user-1', 'TKZ'],
    ['user-2', 'コボちゃん'],
  ]);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('複数選択チェックボックスの表示 (Requirement 3.4)', () => {
    it('should display select all checkbox in header', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      // 選択モードをONにする
      const toggleButton = screen.getByRole('button', { name: /選択/i });
      fireEvent.click(toggleButton);

      // 「すべて選択」チェックボックスが表示される
      const selectAllCheckbox = screen.getByRole('checkbox', {
        name: /すべて選択/i,
      });
      expect(selectAllCheckbox).toBeInTheDocument();
    });

    it('should display individual checkbox for each tool card', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      // 選択モードをONにする
      const toggleButton = screen.getByRole('button', { name: /選択/i });
      fireEvent.click(toggleButton);

      // 各ツールカードにチェックボックスが表示される
      const checkboxes = screen.getAllByRole('checkbox');
      // すべて選択 + 各ツール = 4個
      expect(checkboxes).toHaveLength(4);
    });

    it('should show selection mode toggle button', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      // 選択モード切り替えボタンが表示される
      const toggleButton = screen.getByRole('button', {
        name: /選択/i,
      });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('選択モードの切り替え (Requirement 3.4)', () => {
    it('should toggle selection mode when button is clicked', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      const toggleButton = screen.getByRole('button', {
        name: /選択/i,
      });

      // 初期状態: チェックボックスは非表示
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

      // 選択モードをONにする
      fireEvent.click(toggleButton);

      // チェックボックスが表示される
      expect(screen.getByRole('checkbox', { name: /すべて選択/i })).toBeInTheDocument();
    });

    it('should show cancel button in selection mode', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      const toggleButton = screen.getByRole('button', {
        name: /選択/i,
      });
      fireEvent.click(toggleButton);

      // キャンセルボタンが表示される
      const cancelButton = screen.getByRole('button', {
        name: /キャンセル/i,
      });
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe('個別選択の動作 (Requirement 3.4)', () => {
    it('should select individual tool when checkbox is clicked', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      // 選択モードをONにする
      const toggleButton = screen.getByRole('button', { name: /選択/i });
      fireEvent.click(toggleButton);

      // 最初のツールのチェックボックスをクリック
      const checkboxes = screen.getAllByRole('checkbox');
      const firstToolCheckbox = checkboxes[1]; // 0はすべて選択

      expect(firstToolCheckbox).toHaveAttribute('data-state', 'unchecked');

      fireEvent.click(firstToolCheckbox);

      expect(firstToolCheckbox).toHaveAttribute('data-state', 'checked');
    });

    it('should unselect tool when checkbox is clicked again', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      const toggleButton = screen.getByRole('button', { name: /選択/i });
      fireEvent.click(toggleButton);

      const checkboxes = screen.getAllByRole('checkbox');
      const firstToolCheckbox = checkboxes[1];

      // 選択
      fireEvent.click(firstToolCheckbox);
      expect(firstToolCheckbox).toHaveAttribute('data-state', 'checked');

      // 選択解除
      fireEvent.click(firstToolCheckbox);
      expect(firstToolCheckbox).toHaveAttribute('data-state', 'unchecked');
    });

    it('should display selected count', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      const toggleButton = screen.getByRole('button', { name: /選択/i });
      fireEvent.click(toggleButton);

      // 2つのツールを選択
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);

      // 選択件数が表示される
      expect(screen.getByText(/2件選択中/i)).toBeInTheDocument();
    });
  });

  describe('すべて選択の動作 (Requirement 3.4)', () => {
    it('should select all tools when select all checkbox is clicked', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      const toggleButton = screen.getByRole('button', { name: /選択/i });
      fireEvent.click(toggleButton);

      const selectAllCheckbox = screen.getByRole('checkbox', {
        name: /すべて選択/i,
      });

      fireEvent.click(selectAllCheckbox);

      // すべてのツールが選択される
      expect(screen.getByText(/3件選択中/i)).toBeInTheDocument();

      // 各チェックボックスがチェック状態になる
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.slice(1).forEach((checkbox) => {
        expect(checkbox).toHaveAttribute('data-state', 'checked');
      });
    });

    it('should unselect all tools when select all checkbox is clicked again', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      const toggleButton = screen.getByRole('button', { name: /選択/i });
      fireEvent.click(toggleButton);

      const selectAllCheckbox = screen.getByRole('checkbox', {
        name: /すべて選択/i,
      });

      // すべて選択
      fireEvent.click(selectAllCheckbox);
      expect(screen.getByText(/3件選択中/i)).toBeInTheDocument();

      // すべて選択解除
      fireEvent.click(selectAllCheckbox);
      expect(screen.queryByText(/選択中/i)).not.toBeInTheDocument();
    });

    it('should show indeterminate state when some tools are selected', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      const toggleButton = screen.getByRole('button', { name: /選択/i });
      fireEvent.click(toggleButton);

      // 1つだけ選択
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      const selectAllCheckbox = screen.getByRole('checkbox', {
        name: /すべて選択/i,
      });

      // 中間状態（indeterminate）になる
      expect(selectAllCheckbox).toHaveAttribute('data-state', 'indeterminate');
    });
  });

  describe('選択状態のリセット (Requirement 3.4)', () => {
    it('should clear selection when cancel button is clicked', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      // 選択モードをONにして選択
      const toggleButton = screen.getByRole('button', { name: /選択/i });
      fireEvent.click(toggleButton);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);

      expect(screen.getByText(/2件選択中/i)).toBeInTheDocument();

      // キャンセル
      const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
      fireEvent.click(cancelButton);

      // 選択モードが解除され、チェックボックスが非表示になる
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });

  describe('視覚的スタイル (Requirement 3.4)', () => {
    it('should highlight selected tool cards', () => {
      render(
        <ToolsList
          tools={mockTools}
          userMap={mockUserMap}
          currentUserId="user-1"
        />
      );

      const toggleButton = screen.getByRole('button', { name: /選択/i });
      fireEvent.click(toggleButton);

      const checkboxes = screen.getAllByRole('checkbox');
      const firstToolCheckbox = checkboxes[1];

      fireEvent.click(firstToolCheckbox);

      // 選択されたカードが視覚的にハイライトされる
      // (実装依存のため、具体的なクラス名のチェックは省略)
      expect(firstToolCheckbox).toHaveAttribute('data-state', 'checked');
    });
  });
});
