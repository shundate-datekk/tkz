/**
 * バックアップ機能のテスト
 * Requirements: 10.6, 10.7, 10.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ファクトリー関数でモック
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

// モック後にインポート
import { createBackupAction, listBackupsAction, restoreBackupAction } from '../backup.actions';
import { auth } from '@/auth';
import { supabase } from '@/lib/supabase/client';

describe('Backup Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBackupAction', () => {
    it('認証されていない場合、エラーを返すべき', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await createBackupAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証が必要です');
    });

    it('バックアップを正常に作成できるべき', async () => {
      // 認証モック
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any);

      // ツールデータ取得モック
      const mockTools = [
        { id: '1', tool_name: 'Tool 1', category: 'text' },
        { id: '2', tool_name: 'Tool 2', category: 'image' },
      ];

      // プロンプト履歴取得モック
      const mockPrompts = [
        { id: 'p1', input_text: 'Test prompt' },
      ];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'ai_tools') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockTools, error: null }),
          } as any;
        }
        if (table === 'prompt_history') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockPrompts, error: null }),
          } as any;
        }
        if (table === 'backups') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'backup-123',
                user_id: 'user-123',
                storage_url: 'https://storage.example.com/backup-123.json',
                file_size: 1024,
                tool_count: 2,
                prompt_count: 1,
                created_at: '2025-10-24T00:00:00Z',
              },
              error: null,
            }),
          } as any;
        }
        return {} as any;
      });

      // Storage モック
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'backups/backup-123.json' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://storage.example.com/backup-123.json' } }),
      } as any);

      const result = await createBackupAction();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.toolCount).toBe(2);
      expect(result.data?.promptCount).toBe(1);
    });
  });

  describe('listBackupsAction', () => {
    it('認証されていない場合、エラーを返すべき', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await listBackupsAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証が必要です');
    });

    it('バックアップリストを正常に取得できるべき', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any);

      const mockBackups = [
        {
          id: 'backup-1',
          user_id: 'user-123',
          storage_url: 'https://storage.example.com/backup-1.json',
          file_size: 1024,
          tool_count: 5,
          prompt_count: 3,
          created_at: '2025-10-24T00:00:00Z',
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBackups, error: null }),
      } as any);

      const result = await listBackupsAction();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe('backup-1');
    });
  });

  describe('restoreBackupAction', () => {
    it('認証されていない場合、エラーを返すべき', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await restoreBackupAction('backup-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証が必要です');
    });

    it('バックアップを正常に復元できるべき', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any);

      // バックアップメタデータ取得モック
      const mockBackup = {
        id: 'backup-123',
        user_id: 'user-123',
        storage_url: 'https://storage.example.com/user-backups/backups/user-123/backup.json',
      };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'backups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockBackup, error: null }),
          } as any;
        }
        if (table === 'ai_tools' || table === 'prompt_history') {
          return {
            insert: vi.fn().mockResolvedValue({ data: [], error: null }),
          } as any;
        }
        return {} as any;
      });

      // Storage からダウンロードモック
      const mockBackupData = {
        tools: [{ tool_name: 'Tool 1', category: 'text', usage_purpose: 'Test', user_experience: 'Good', rating: 5 }],
        prompts: [{ input_text: 'Prompt 1', generated_prompt: 'Generated', output_language: 'en' }],
      };

      // Blobに text() メソッドを追加
      const mockBlob = {
        text: vi.fn().mockResolvedValue(JSON.stringify(mockBackupData)),
      };

      vi.mocked(supabase.storage.from).mockReturnValue({
        download: vi.fn().mockResolvedValue({
          data: mockBlob,
          error: null,
        }),
      } as any);

      const result = await restoreBackupAction('backup-123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('他人のバックアップを復元しようとした場合、エラーを返すべき', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any);

      // 他人のバックアップ
      const mockBackup = {
        id: 'backup-123',
        user_id: 'other-user',
        storage_url: 'https://storage.example.com/backup-123.json',
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockBackup, error: null }),
      } as any);

      const result = await restoreBackupAction('backup-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('このバックアップを復元する権限がありません');
    });
  });
});
