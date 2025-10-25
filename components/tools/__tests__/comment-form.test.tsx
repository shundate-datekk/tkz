/**
 * CommentForm コンポーネントのテスト
 * Requirements: 12.1, 12.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentForm } from '../comment-form';

// Server Actionのモック
vi.mock('@/lib/actions/comment.actions', () => ({
  createCommentAction: vi.fn(),
}));

import { createCommentAction } from '@/lib/actions/comment.actions';

describe('CommentForm', () => {
  const mockToolId = 'test-tool-id-123';
  const mockOnCommentPosted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('フォームのレンダリング', () => {
    it('テキストエリアと投稿ボタンが表示されるべき', () => {
      render(<CommentForm toolId={mockToolId} />);

      expect(screen.getByPlaceholderText(/コメントを入力/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /投稿/i })).toBeInTheDocument();
    });

    it('文字数カウンターが表示されるべき', () => {
      render(<CommentForm toolId={mockToolId} />);

      expect(screen.getByText(/0\/1000文字/)).toBeInTheDocument();
    });

    it('初期状態で投稿ボタンが無効になっているべき', () => {
      render(<CommentForm toolId={mockToolId} />);

      const submitButton = screen.getByRole('button', { name: /投稿/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('文字数制限', () => {
    it('1文字以上入力すると投稿ボタンが有効になるべき', async () => {
      const user = userEvent.setup();
      render(<CommentForm toolId={mockToolId} />);

      const textarea = screen.getByPlaceholderText(/コメントを入力/i);
      await user.type(textarea, 'テストコメント');

      const submitButton = screen.getByRole('button', { name: /投稿/i });
      expect(submitButton).toBeEnabled();
    });

    it('文字数カウンターが正しく更新されるべき', async () => {
      const user = userEvent.setup();
      render(<CommentForm toolId={mockToolId} />);

      const textarea = screen.getByPlaceholderText(/コメントを入力/i);
      await user.type(textarea, 'テストコメント');

      await waitFor(() => {
        expect(screen.getByText(/7\/1000文字/)).toBeInTheDocument();
      });
    });

    it('1000文字を超える入力を防ぐべき', async () => {
      const user = userEvent.setup();
      render(<CommentForm toolId={mockToolId} />);

      const longText = 'あ'.repeat(1001);
      const textarea = screen.getByPlaceholderText(/コメントを入力/i);
      await user.type(textarea, longText);

      // maxLength属性により1000文字までしか入力できない
      expect(textarea).toHaveAttribute('maxLength', '1000');
    });

    it('1000文字ちょうどの入力は許可されるべき', async () => {
      const user = userEvent.setup();
      render(<CommentForm toolId={mockToolId} />);

      const maxText = 'あ'.repeat(1000);
      const textarea = screen.getByPlaceholderText(/コメントを入力/i);
      await user.clear(textarea);
      await user.type(textarea, maxText);

      await waitFor(() => {
        expect(screen.getByText(/1000\/1000文字/)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /投稿/i });
      expect(submitButton).toBeEnabled();
    });
  });

  describe('コメント投稿', () => {
    it('正常にコメントを投稿できるべき', async () => {
      const user = userEvent.setup();
      vi.mocked(createCommentAction).mockResolvedValue({
        success: true,
        data: {
          id: 'comment-id',
          tool_id: mockToolId,
          user_id: 'user-id',
          content: 'テストコメント',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      render(
        <CommentForm toolId={mockToolId} onCommentPosted={mockOnCommentPosted} />
      );

      const textarea = screen.getByPlaceholderText(/コメントを入力/i);
      await user.type(textarea, 'テストコメント');

      const submitButton = screen.getByRole('button', { name: /投稿/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createCommentAction).toHaveBeenCalledWith({
          toolId: mockToolId,
          content: 'テストコメント',
        });
      });

      // フォームがクリアされる
      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });

      // コールバックが呼ばれる
      expect(mockOnCommentPosted).toHaveBeenCalled();
    });

    it('投稿中はローディング状態になるべき', async () => {
      const user = userEvent.setup();
      let resolveAction: any;
      vi.mocked(createCommentAction).mockReturnValue(
        new Promise((resolve) => {
          resolveAction = resolve;
        })
      );

      render(<CommentForm toolId={mockToolId} />);

      const textarea = screen.getByPlaceholderText(/コメントを入力/i);
      await user.type(textarea, 'テストコメント');

      const submitButton = screen.getByRole('button', { name: /投稿/i });
      await user.click(submitButton);

      // ローディング中はボタンが無効化される
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // ローディングスピナーが表示される
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // 投稿完了
      resolveAction({
        success: true,
        data: {
          id: 'comment-id',
          tool_id: mockToolId,
          user_id: 'user-id',
          content: 'テストコメント',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      // フォームがクリアされることを確認
      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
    });

    it('投稿失敗時はエラーメッセージを表示するべき', async () => {
      const user = userEvent.setup();
      vi.mocked(createCommentAction).mockResolvedValue({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'コメントの投稿に失敗しました',
        },
      });

      render(<CommentForm toolId={mockToolId} />);

      const textarea = screen.getByPlaceholderText(/コメントを入力/i);
      await user.type(textarea, 'テストコメント');

      const submitButton = screen.getByRole('button', { name: /投稿/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/コメントの投稿に失敗しました/i)
        ).toBeInTheDocument();
      });

      // フォームはクリアされない
      expect(textarea).toHaveValue('テストコメント');
    });
  });

  describe('アクセシビリティ', () => {
    it('テキストエリアにaria-labelが設定されているべき', () => {
      render(<CommentForm toolId={mockToolId} />);

      const textarea = screen.getByPlaceholderText(/コメントを入力/i);
      expect(textarea).toHaveAccessibleName();
    });

    it('エラー時はaria-invalidが設定されるべき', async () => {
      const user = userEvent.setup();
      vi.mocked(createCommentAction).mockResolvedValue({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'コメントを入力してください',
        },
      });

      render(<CommentForm toolId={mockToolId} />);

      const textarea = screen.getByPlaceholderText(/コメントを入力/i);
      await user.type(textarea, 'テスト');

      const submitButton = screen.getByRole('button', { name: /投稿/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(textarea).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
