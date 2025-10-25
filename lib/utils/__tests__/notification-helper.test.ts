/**
 * 通知ヘルパー関数のテスト
 * Requirements: 12.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  notifyToolCreated,
  notifyCommentCreated,
  notifyLikeCreated,
} from '../notification-helper';
import * as supabaseServer from '@/lib/supabase/server';

// Supabase serverをモック
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Notification Helper Functions', () => {
  let mockInsert: any;
  let mockFrom: any;
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
    mockSupabase = { from: mockFrom };

    vi.mocked(supabaseServer.createClient).mockResolvedValue(
      mockSupabase as any
    );
  });

  describe('notifyToolCreated', () => {
    it('ツール作成通知を正しく作成するべき', async () => {
      const result = await notifyToolCreated({
        toolId: 'tool-123',
        toolName: 'ChatGPT',
        authorId: 'user-1',
        authorName: 'TKZ',
        recipientId: 'user-2',
      });

      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('notifications');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-2',
        actor_id: 'user-1',
        type: 'tool_created',
        resource_type: 'tool',
        resource_id: 'tool-123',
        resource_name: 'ChatGPT',
        message: 'TKZさんが新しいツール「ChatGPT」を登録しました',
        is_read: false,
      });
    });

    it('自分自身への通知は作成しないべき', async () => {
      const result = await notifyToolCreated({
        toolId: 'tool-123',
        toolName: 'ChatGPT',
        authorId: 'user-1',
        authorName: 'TKZ',
        recipientId: 'user-1', // 同じユーザー
      });

      expect(result.success).toBe(true);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('データベースエラー時はエラーを返すべき', async () => {
      mockInsert.mockResolvedValue({ error: { message: 'DB Error' } });

      const result = await notifyToolCreated({
        toolId: 'tool-123',
        toolName: 'ChatGPT',
        authorId: 'user-1',
        authorName: 'TKZ',
        recipientId: 'user-2',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('通知の作成に失敗しました');
    });
  });

  describe('notifyCommentCreated', () => {
    it('コメント作成通知を正しく作成するべき', async () => {
      const result = await notifyCommentCreated({
        commentId: 'comment-123',
        toolId: 'tool-123',
        toolName: 'ChatGPT',
        authorId: 'user-1',
        authorName: 'TKZ',
        recipientId: 'user-2',
      });

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-2',
        actor_id: 'user-1',
        type: 'comment',
        resource_type: 'comment',
        resource_id: 'comment-123',
        resource_name: 'ChatGPT',
        message: 'TKZさんがツール「ChatGPT」にコメントしました',
        is_read: false,
      });
    });

    it('自分自身への通知は作成しないべき', async () => {
      const result = await notifyCommentCreated({
        commentId: 'comment-123',
        toolId: 'tool-123',
        toolName: 'ChatGPT',
        authorId: 'user-1',
        authorName: 'TKZ',
        recipientId: 'user-1',
      });

      expect(result.success).toBe(true);
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  describe('notifyLikeCreated', () => {
    it('いいね通知を正しく作成するべき', async () => {
      const result = await notifyLikeCreated({
        toolId: 'tool-123',
        toolName: 'ChatGPT',
        authorId: 'user-1',
        authorName: 'TKZ',
        recipientId: 'user-2',
      });

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-2',
        actor_id: 'user-1',
        type: 'like',
        resource_type: 'tool',
        resource_id: 'tool-123',
        resource_name: 'ChatGPT',
        message: 'TKZさんがツール「ChatGPT」にいいねしました',
        is_read: false,
      });
    });

    it('自分自身への通知は作成しないべき', async () => {
      const result = await notifyLikeCreated({
        toolId: 'tool-123',
        toolName: 'ChatGPT',
        authorId: 'user-1',
        authorName: 'TKZ',
        recipientId: 'user-1',
      });

      expect(result.success).toBe(true);
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });
});
