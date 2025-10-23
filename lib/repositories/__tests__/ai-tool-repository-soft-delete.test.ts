import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { aiToolRepository } from '../ai-tool-repository';
import { supabase } from '@/lib/supabase/client';
import type { CreateAIToolInput } from '@/lib/schemas/ai-tool.schema';

/**
 * 論理削除機能のリポジトリ層テスト
 *
 * Requirements: 3.2
 *
 * Note: These are integration tests that require a database connection
 */

describe('AIToolRepository - Soft Delete Integration', () => {
  const testUserId = 'test-user-soft-delete';
  let testToolId: string;

  beforeAll(async () => {
    // Create test user if needed
    // This is a simplified version - in production you'd use proper user creation
  });

  beforeEach(async () => {
    // Create a test tool
    const testInput: CreateAIToolInput = {
      tool_name: 'Test Tool for Soft Delete',
      category: 'テスト',
      usage_purpose: 'テスト目的',
      user_experience: 'テスト体験',
      rating: 5,
      usage_date: '2025-10-23',
    };

    const tool = await aiToolRepository.create(testInput, testUserId);
    if (tool) {
      testToolId = tool.id;
    }
  });

  afterAll(async () => {
    // Cleanup: Hard delete all test data
    await supabase.from('ai_tools').delete().eq('created_by', testUserId);
  });

  describe('論理削除 (Requirement 3.2)', () => {
    it('should set deleted_at timestamp when soft deleting', async () => {
      const result = await aiToolRepository.softDelete(testToolId);

      expect(result).toBe(true);

      // Verify deleted_at is set by querying without filter
      const { data } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('id', testToolId)
        .single();

      expect(data?.deleted_at).toBeTruthy();
    });

    it('should not return soft deleted tools in findById', async () => {
      await aiToolRepository.softDelete(testToolId);

      const tool = await aiToolRepository.findById(testToolId);

      expect(tool).toBeNull();
    });

    it('should not return soft deleted tools in findAll', async () => {
      await aiToolRepository.softDelete(testToolId);

      const tools = await aiToolRepository.findAll();

      const deletedTool = tools.find((t) => t.id === testToolId);
      expect(deletedTool).toBeUndefined();
    });
  });

  describe('削除されたツールの取得 (Requirement 3.2)', () => {
    it('should retrieve only deleted tools for user', async () => {
      await aiToolRepository.softDelete(testToolId);

      const deletedTools = await aiToolRepository.findDeletedTools(testUserId);

      expect(deletedTools.length).toBeGreaterThan(0);
      expect(deletedTools.every((t) => t.deleted_at !== null)).toBe(true);
      expect(deletedTools.every((t) => t.created_by === testUserId)).toBe(true);
    });

    it('should only return tools deleted within 30 days', async () => {
      await aiToolRepository.softDelete(testToolId);

      // Manually set deleted_at to 31 days ago
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      await supabase
        .from('ai_tools')
        .update({ deleted_at: oldDate.toISOString() })
        .eq('id', testToolId);

      const deletedTools = await aiToolRepository.findDeletedTools(testUserId);

      const oldDeletedTool = deletedTools.find((t) => t.id === testToolId);
      expect(oldDeletedTool).toBeUndefined();
    });
  });

  describe('復元機能 (Requirement 3.2)', () => {
    it('should restore soft deleted tool by clearing deleted_at', async () => {
      await aiToolRepository.softDelete(testToolId);

      const restored = await aiToolRepository.restore(testToolId, testUserId);

      expect(restored).toBeTruthy();
      expect(restored?.deleted_at).toBeNull();

      // Verify it appears in normal queries
      const tool = await aiToolRepository.findById(testToolId);
      expect(tool).toBeTruthy();
      expect(tool?.id).toBe(testToolId);
    });

    it('should not restore tool deleted more than 30 days ago', async () => {
      await aiToolRepository.softDelete(testToolId);

      // Set deleted_at to 31 days ago
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      await supabase
        .from('ai_tools')
        .update({ deleted_at: oldDate.toISOString() })
        .eq('id', testToolId);

      const restored = await aiToolRepository.restore(testToolId, testUserId);

      expect(restored).toBeNull();
    });

    it('should only allow owner to restore tool', async () => {
      await aiToolRepository.softDelete(testToolId);

      const restored = await aiToolRepository.restore(
        testToolId,
        'different-user-id'
      );

      expect(restored).toBeNull();
    });
  });

  describe('30日後自動削除 (Requirement 3.2)', () => {
    it('should permanently delete tools older than 30 days', async () => {
      await aiToolRepository.softDelete(testToolId);

      // Set deleted_at to 31 days ago
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      await supabase
        .from('ai_tools')
        .update({ deleted_at: oldDate.toISOString() })
        .eq('id', testToolId);

      const count = await aiToolRepository.cleanupOldDeletedTools(30);

      expect(count).toBeGreaterThan(0);

      // Verify tool is permanently deleted
      const { data } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('id', testToolId)
        .single();

      expect(data).toBeNull();
    });

    it('should not delete tools within 30 day window', async () => {
      await aiToolRepository.softDelete(testToolId);

      // Set deleted_at to 15 days ago
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15);
      await supabase
        .from('ai_tools')
        .update({ deleted_at: recentDate.toISOString() })
        .eq('id', testToolId);

      await aiToolRepository.cleanupOldDeletedTools(30);

      // Verify tool still exists
      const { data } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('id', testToolId)
        .single();

      expect(data).toBeTruthy();
    });
  });
});
