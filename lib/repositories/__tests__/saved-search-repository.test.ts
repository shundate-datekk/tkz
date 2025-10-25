/**
 * SavedSearchRepository のテスト
 * Requirements: 11.3, 11.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SavedSearchRepository } from '../saved-search-repository';
import type { AdvancedSearchConditions } from '@/lib/types/search';

describe('SavedSearchRepository', () => {
  let repository: SavedSearchRepository;
  const testUserId = 'test-user-id';

  beforeEach(() => {
    repository = new SavedSearchRepository();
  });

  describe('create', () => {
    it('保存済み検索を作成できるべき', async () => {
      const searchData = {
        user_id: testUserId,
        name: '画像生成ツール検索',
        conditions: {
          keyword: '画像',
          operator: 'AND' as const,
          category: ['image'],
          ratingRange: { min: 4, max: 5 },
        },
      };

      const result = await repository.create(searchData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(searchData.name);
        expect(result.data.user_id).toBe(testUserId);
        expect(result.data.conditions.keyword).toBe('画像');
        expect(result.data.id).toBeDefined();
        expect(result.data.created_at).toBeDefined();
      }
    });
  });

  describe('findAllByUserId', () => {
    it('ユーザーの保存済み検索を全て取得できるべき', async () => {
      // 2つの保存済み検索を作成
      await repository.create({
        user_id: testUserId,
        name: '検索1',
        conditions: {
          keyword: 'ChatGPT',
          operator: 'AND',
        },
      });

      await repository.create({
        user_id: testUserId,
        name: '検索2',
        conditions: {
          keyword: 'Sora',
          operator: 'OR',
        },
      });

      const result = await repository.findAllByUserId(testUserId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeGreaterThanOrEqual(2);
        expect(result.data.every(s => s.user_id === testUserId)).toBe(true);
      }
    });

    it('保存済み検索がないユーザーの場合は空配列を返すべき', async () => {
      const result = await repository.findAllByUserId('no-searches-user-id');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });

  describe('findById', () => {
    it('IDで保存済み検索を取得できるべき', async () => {
      const createResult = await repository.create({
        user_id: testUserId,
        name: 'テスト検索',
        conditions: {
          keyword: 'test',
          operator: 'AND',
        },
      });

      if (createResult.success) {
        const findResult = await repository.findById(createResult.data.id);

        expect(findResult.success).toBe(true);
        if (findResult.success) {
          expect(findResult.data?.id).toBe(createResult.data.id);
          expect(findResult.data?.name).toBe('テスト検索');
        }
      }
    });

    it('存在しないIDの場合はnullを返すべき', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe('update', () => {
    it('保存済み検索の名前を更新できるべき', async () => {
      const createResult = await repository.create({
        user_id: testUserId,
        name: '元の名前',
        conditions: {
          keyword: 'original',
          operator: 'AND',
        },
      });

      if (createResult.success) {
        const updateResult = await repository.update(createResult.data.id, {
          name: '新しい名前',
        });

        expect(updateResult.success).toBe(true);

        // 検証: 更新されたか確認
        const findResult = await repository.findById(createResult.data.id);
        if (findResult.success && findResult.data) {
          expect(findResult.data.name).toBe('新しい名前');
        }
      }
    });

    it('保存済み検索の条件を更新できるべき', async () => {
      const createResult = await repository.create({
        user_id: testUserId,
        name: '条件更新テスト',
        conditions: {
          keyword: 'old',
          operator: 'AND',
        },
      });

      if (createResult.success) {
        const newConditions: AdvancedSearchConditions = {
          keyword: 'new',
          operator: 'OR',
          category: ['video'],
        };

        const updateResult = await repository.update(createResult.data.id, {
          conditions: newConditions,
        });

        expect(updateResult.success).toBe(true);

        // 検証: 更新されたか確認
        const findResult = await repository.findById(createResult.data.id);
        if (findResult.success && findResult.data) {
          expect(findResult.data.conditions.keyword).toBe('new');
          expect(findResult.data.conditions.operator).toBe('OR');
          expect(findResult.data.conditions.category).toEqual(['video']);
        }
      }
    });
  });

  describe('delete', () => {
    it('保存済み検索を削除できるべき', async () => {
      const createResult = await repository.create({
        user_id: testUserId,
        name: '削除テスト',
        conditions: {
          keyword: 'delete',
          operator: 'AND',
        },
      });

      if (createResult.success) {
        const deleteResult = await repository.delete(createResult.data.id);

        expect(deleteResult.success).toBe(true);

        // 検証: 削除されたか確認
        const findResult = await repository.findById(createResult.data.id);
        if (findResult.success) {
          expect(findResult.data).toBeNull();
        }
      }
    });
  });
});
