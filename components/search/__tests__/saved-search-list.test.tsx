/**
 * SavedSearchList コンポーネントのテスト
 * Requirements: 11.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SavedSearchList } from '../saved-search-list';
import * as savedSearchActions from '@/lib/actions/saved-search.actions';
import type { SavedSearch } from '@/lib/types/saved-search';

// Server Actionsをモック
vi.mock('@/lib/actions/saved-search.actions', () => ({
  getSavedSearchesAction: vi.fn(),
  deleteSavedSearchAction: vi.fn(),
}));

describe('SavedSearchList', () => {
  const mockOnSelectSearch = vi.fn();

  const mockSavedSearches: SavedSearch[] = [
    {
      id: 'search-1',
      user_id: 'user-1',
      name: 'プロダクティビティツール',
      conditions: {
        keyword: '',
        category: 'productivity',
        isLiked: null,
        hasComments: null,
        dateRange: null,
      },
      created_at: new Date('2024-01-01').toISOString(),
    },
    {
      id: 'search-2',
      user_id: 'user-1',
      name: 'いいねした開発ツール',
      conditions: {
        keyword: '',
        category: 'development',
        isLiked: true,
        hasComments: null,
        dateRange: null,
      },
      created_at: new Date('2024-01-15').toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('保存済み検索の表示', () => {
    it('保存済み検索がある場合は一覧を表示するべき', async () => {
      vi.mocked(savedSearchActions.getSavedSearchesAction).mockResolvedValue({
        success: true,
        data: mockSavedSearches,
      });

      render(<SavedSearchList onSelectSearch={mockOnSelectSearch} />);

      await waitFor(() => {
        expect(screen.getByText('プロダクティビティツール')).toBeInTheDocument();
        expect(screen.getByText('いいねした開発ツール')).toBeInTheDocument();
      });
    });

    it('保存済み検索がない場合は空の状態を表示するべき', async () => {
      vi.mocked(savedSearchActions.getSavedSearchesAction).mockResolvedValue({
        success: true,
        data: [],
      });

      render(<SavedSearchList onSelectSearch={mockOnSelectSearch} />);

      await waitFor(() => {
        expect(screen.getByText('保存済み検索はありません')).toBeInTheDocument();
      });
    });

    it('作成日が表示されるべき', async () => {
      vi.mocked(savedSearchActions.getSavedSearchesAction).mockResolvedValue({
        success: true,
        data: mockSavedSearches,
      });

      render(<SavedSearchList onSelectSearch={mockOnSelectSearch} />);

      await waitFor(() => {
        expect(screen.getByText('2024/1/1')).toBeInTheDocument();
        expect(screen.getByText('2024/1/15')).toBeInTheDocument();
      });
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はスピナーを表示するべき', () => {
      vi.mocked(savedSearchActions.getSavedSearchesAction).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, data: [] }), 100)
          )
      );

      const { container } = render(<SavedSearchList onSelectSearch={mockOnSelectSearch} />);

      // Loader2アイコンのanimateクラスを持つ要素が存在することを確認
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('検索選択機能', () => {
    it('保存済み検索をクリックすると検索条件が適用されるべき', async () => {
      vi.mocked(savedSearchActions.getSavedSearchesAction).mockResolvedValue({
        success: true,
        data: mockSavedSearches,
      });

      render(<SavedSearchList onSelectSearch={mockOnSelectSearch} />);

      await waitFor(() => {
        expect(screen.getByText('プロダクティビティツール')).toBeInTheDocument();
      });

      const searchButton = screen.getByText('プロダクティビティツール').closest('button');
      if (searchButton) {
        fireEvent.click(searchButton);
      }

      expect(mockOnSelectSearch).toHaveBeenCalledWith({
        keyword: '',
        category: 'productivity',
        isLiked: null,
        hasComments: null,
        dateRange: null,
      });
    });
  });

  describe('削除機能', () => {
    it('削除ボタンをクリックすると確認ダイアログが表示されるべき', async () => {
      vi.mocked(savedSearchActions.getSavedSearchesAction).mockResolvedValue({
        success: true,
        data: mockSavedSearches,
      });

      render(<SavedSearchList onSelectSearch={mockOnSelectSearch} />);

      await waitFor(() => {
        expect(screen.getByText('プロダクティビティツール')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByLabelText('削除');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('保存済み検索を削除')).toBeInTheDocument();
        expect(
          screen.getByText(/「プロダクティビティツール」を削除してもよろしいですか？/)
        ).toBeInTheDocument();
      });
    });

    it('削除を確定すると保存済み検索が削除されるべき', async () => {
      vi.mocked(savedSearchActions.getSavedSearchesAction).mockResolvedValue({
        success: true,
        data: mockSavedSearches,
      });
      vi.mocked(savedSearchActions.deleteSavedSearchAction).mockResolvedValue({
        success: true,
        data: undefined,
      });

      render(<SavedSearchList onSelectSearch={mockOnSelectSearch} />);

      await waitFor(() => {
        expect(screen.getByText('プロダクティビティツール')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByLabelText('削除');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('保存済み検索を削除')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: '削除' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(savedSearchActions.deleteSavedSearchAction).toHaveBeenCalledWith('search-1');
      });
    });

    it('削除をキャンセルするとダイアログが閉じるべき', async () => {
      vi.mocked(savedSearchActions.getSavedSearchesAction).mockResolvedValue({
        success: true,
        data: mockSavedSearches,
      });

      render(<SavedSearchList onSelectSearch={mockOnSelectSearch} />);

      await waitFor(() => {
        expect(screen.getByText('プロダクティビティツール')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByLabelText('削除');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('保存済み検索を削除')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('保存済み検索を削除')).not.toBeInTheDocument();
      });
    });
  });
});
