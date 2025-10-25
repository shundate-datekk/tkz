/**
 * CommentList コンポーネントのテスト
 * Requirements: 12.1, 12.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentList } from '../comment-list';
import type { Comment } from '@/lib/types/comment';

// Server Actionのモック
vi.mock('@/lib/actions/comment.actions', () => ({
  deleteCommentAction: vi.fn(),
  updateCommentAction: vi.fn(),
}));

import {
  deleteCommentAction,
  updateCommentAction,
} from '@/lib/actions/comment.actions';

describe('CommentList', () => {
  const mockCurrentUserId = 'current-user-id';
  const mockComments: Comment[] = [
    {
      id: 'comment-1',
      tool_id: 'tool-id',
      user_id: mockCurrentUserId,
      content: '自分のコメント',
      created_at: new Date('2024-01-01T10:00:00Z').toISOString(),
      updated_at: new Date('2024-01-01T10:00:00Z').toISOString(),
      user_name: 'TKZ',
    },
    {
      id: 'comment-2',
      tool_id: 'tool-id',
      user_id: 'other-user-id',
      content: '他のユーザーのコメント',
      created_at: new Date('2024-01-02T10:00:00Z').toISOString(),
      updated_at: new Date('2024-01-02T10:00:00Z').toISOString(),
      user_name: 'コボちゃん',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('コメント表示', () => {
    it('コメントリストが正しく表示されるべき', () => {
      render(
        <CommentList comments={mockComments} currentUserId={mockCurrentUserId} />
      );

      expect(screen.getByText('自分のコメント')).toBeInTheDocument();
      expect(screen.getByText('他のユーザーのコメント')).toBeInTheDocument();
    });

    it('コメントが新しい順に表示されるべき', () => {
      render(
        <CommentList comments={mockComments} currentUserId={mockCurrentUserId} />
      );

      const comments = screen.getAllByRole('article');
      // 新しいコメント（comment-2）が最初に表示される
      expect(comments[0]).toHaveTextContent('他のユーザーのコメント');
      expect(comments[1]).toHaveTextContent('自分のコメント');
    });

    it('投稿者名と投稿日時が表示されるべき', () => {
      render(
        <CommentList comments={mockComments} currentUserId={mockCurrentUserId} />
      );

      expect(screen.getByText('TKZ')).toBeInTheDocument();
      expect(screen.getByText('コボちゃん')).toBeInTheDocument();

      // 相対時間表示
      expect(screen.getAllByText(/前/i).length).toBeGreaterThan(0);
    });

    it('コメントが0件の場合は空状態を表示するべき', () => {
      render(
        <CommentList comments={[]} currentUserId={mockCurrentUserId} />
      );

      expect(
        screen.getByText(/まだコメントがありません/i)
      ).toBeInTheDocument();
    });
  });

  describe('自分のコメントの操作', () => {
    it('自分のコメントには編集・削除ボタンが表示されるべき', () => {
      render(
        <CommentList comments={mockComments} currentUserId={mockCurrentUserId} />
      );

      const myComment = screen.getByText('自分のコメント').closest('article')!;
      expect(myComment).toBeInTheDocument();

      // 編集・削除ボタンを探す
      const buttons = myComment.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('他のユーザーのコメントには編集・削除ボタンが表示されないべき', () => {
      render(
        <CommentList comments={mockComments} currentUserId={mockCurrentUserId} />
      );

      const otherComment = screen
        .getByText('他のユーザーのコメント')
        .closest('article')!;
      expect(otherComment).toBeInTheDocument();

      // 編集・削除ボタンがない
      const buttons = otherComment.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });

    it('削除ボタンクリックで確認ダイアログが表示されるべき', async () => {
      const user = userEvent.setup();
      render(
        <CommentList comments={mockComments} currentUserId={mockCurrentUserId} />
      );

      const myComment = screen.getByText('自分のコメント').closest('article')!;
      const deleteButton = myComment.querySelector(
        'button[aria-label*="削除"]'
      ) as HTMLElement;

      await user.click(deleteButton);

      expect(
        screen.getByText(/このコメントを削除しますか/i)
      ).toBeInTheDocument();
    });

    it('コメント削除を実行できるべき', async () => {
      const user = userEvent.setup();
      const mockOnCommentDeleted = vi.fn();
      vi.mocked(deleteCommentAction).mockResolvedValue({
        success: true,
      });

      render(
        <CommentList
          comments={mockComments}
          currentUserId={mockCurrentUserId}
          onCommentDeleted={mockOnCommentDeleted}
        />
      );

      const myComment = screen.getByText('自分のコメント').closest('article')!;
      const deleteButton = myComment.querySelector(
        'button[aria-label*="削除"]'
      ) as HTMLElement;

      await user.click(deleteButton);

      // 確認ダイアログで「削除」をクリック
      const confirmButton = screen.getByRole('button', { name: /削除/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(deleteCommentAction).toHaveBeenCalledWith('comment-1');
      });

      expect(mockOnCommentDeleted).toHaveBeenCalled();
    });

    it('編集モードに切り替えられるべき', async () => {
      const user = userEvent.setup();
      render(
        <CommentList comments={mockComments} currentUserId={mockCurrentUserId} />
      );

      const myComment = screen.getByText('自分のコメント').closest('article')!;
      const editButton = myComment.querySelector(
        'button[aria-label*="編集"]'
      ) as HTMLElement;

      await user.click(editButton);

      // 編集用テキストエリアが表示される
      expect(screen.getByDisplayValue('自分のコメント')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /キャンセル/i })
      ).toBeInTheDocument();
    });

    it('コメントを編集できるべき', async () => {
      const user = userEvent.setup();
      const mockOnCommentUpdated = vi.fn();
      vi.mocked(updateCommentAction).mockResolvedValue({
        success: true,
        data: {
          id: 'comment-1',
          tool_id: 'tool-id',
          user_id: mockCurrentUserId,
          content: '編集後のコメント',
          created_at: new Date('2024-01-01T10:00:00Z').toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      render(
        <CommentList
          comments={mockComments}
          currentUserId={mockCurrentUserId}
          onCommentUpdated={mockOnCommentUpdated}
        />
      );

      const myComment = screen.getByText('自分のコメント').closest('article')!;
      const editButton = myComment.querySelector(
        'button[aria-label*="編集"]'
      ) as HTMLElement;

      await user.click(editButton);

      const textarea = screen.getByDisplayValue('自分のコメント');
      await user.clear(textarea);
      await user.type(textarea, '編集後のコメント');

      const saveButton = screen.getByRole('button', { name: /保存/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(updateCommentAction).toHaveBeenCalledWith({
          commentId: 'comment-1',
          content: '編集後のコメント',
        });
      });

      expect(mockOnCommentUpdated).toHaveBeenCalled();
    });

    it('編集をキャンセルできるべき', async () => {
      const user = userEvent.setup();
      render(
        <CommentList comments={mockComments} currentUserId={mockCurrentUserId} />
      );

      const myComment = screen.getByText('自分のコメント').closest('article')!;
      const editButton = myComment.querySelector(
        'button[aria-label*="編集"]'
      ) as HTMLElement;

      await user.click(editButton);

      const textarea = screen.getByDisplayValue('自分のコメント');
      await user.clear(textarea);
      await user.type(textarea, '変更内容');

      const cancelButton = screen.getByRole('button', { name: /キャンセル/i });
      await user.click(cancelButton);

      // 元のコメントが表示される
      expect(screen.getByText('自分のコメント')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('変更内容')).not.toBeInTheDocument();
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中はスケルトンを表示するべき', () => {
      render(
        <CommentList
          comments={[]}
          currentUserId={mockCurrentUserId}
          isLoading={true}
        />
      );

      expect(screen.getAllByTestId('comment-skeleton').length).toBeGreaterThan(
        0
      );
    });
  });

  describe('アクセシビリティ', () => {
    it('各コメントにarticleロールが設定されているべき', () => {
      render(
        <CommentList comments={mockComments} currentUserId={mockCurrentUserId} />
      );

      const articles = screen.getAllByRole('article');
      expect(articles.length).toBe(2);
    });

    it('編集・削除ボタンにaria-labelが設定されているべき', () => {
      render(
        <CommentList comments={mockComments} currentUserId={mockCurrentUserId} />
      );

      const myComment = screen.getByText('自分のコメント').closest('article')!;
      const editButton = myComment.querySelector(
        'button[aria-label*="編集"]'
      ) as HTMLElement;
      const deleteButton = myComment.querySelector(
        'button[aria-label*="削除"]'
      ) as HTMLElement;

      expect(editButton).toHaveAccessibleName();
      expect(deleteButton).toHaveAccessibleName();
    });
  });
});
