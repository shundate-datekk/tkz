/**
 * TagRepository のテスト
 * Requirements: 11.5, 11.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TagRepository } from '../tag-repository';
import type { Tag } from '@/lib/types/tag';

describe('TagRepository', () => {
  let repository: TagRepository;

  beforeEach(() => {
    repository = new TagRepository();
  });

  describe('create', () => {
    it('新しいタグを作成できるべき', async () => {
      const tagName = 'AI';
      const result = await repository.create(tagName);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(tagName.toLowerCase()); // 正規化
        expect(result.data.id).toBeDefined();
        expect(result.data.created_at).toBeDefined();
      }
    });

    it('既存のタグ名の場合は既存タグを返すべき（冪等性）', async () => {
      const tagName = 'Machine Learning';
      const firstResult = await repository.create(tagName);
      const secondResult = await repository.create(tagName.toUpperCase()); // 大文字

      expect(firstResult.success).toBe(true);
      expect(secondResult.success).toBe(true);

      if (firstResult.success && secondResult.success) {
        expect(firstResult.data.id).toBe(secondResult.data.id); // 同じID
      }
    });
  });

  describe('findByName', () => {
    it('タグ名でタグを検索できるべき', async () => {
      const tagName = 'GPT';
      await repository.create(tagName);

      const result = await repository.findByName(tagName);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.name).toBe(tagName.toLowerCase());
      }
    });

    it('存在しないタグの場合はnullを返すべき', async () => {
      const result = await repository.findByName('NonExistentTag');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('大文字小文字を区別せずに検索できるべき', async () => {
      const tagName = 'DeepLearning';
      await repository.create(tagName);

      const result = await repository.findByName('deeplearning');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toBeNull();
        expect(result.data?.name).toBe(tagName.toLowerCase());
      }
    });
  });

  describe('findAllByToolId', () => {
    it('ツールに紐付いたタグを全て取得できるべき', async () => {
      const toolId = 'test-tool-id';
      const tag1Result = await repository.create('Tag1');
      const tag2Result = await repository.create('Tag2');

      if (tag1Result.success && tag2Result.success) {
        await repository.attachToTool(toolId, [tag1Result.data.id, tag2Result.data.id]);

        const result = await repository.findAllByToolId(toolId);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.length).toBe(2);
          expect(result.data.map(t => t.name).sort()).toEqual(['tag1', 'tag2']);
        }
      }
    });

    it('タグが紐付いていないツールの場合は空配列を返すべき', async () => {
      const result = await repository.findAllByToolId('no-tags-tool-id');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });
  });

  describe('findAllWithUsageCount', () => {
    it('全タグと使用回数を取得できるべき', async () => {
      const tag1Result = await repository.create('PopularTag');
      const tag2Result = await repository.create('RareTag');

      if (tag1Result.success && tag2Result.success) {
        // PopularTagを2つのツールに紐付け
        await repository.attachToTool('tool1', [tag1Result.data.id]);
        await repository.attachToTool('tool2', [tag1Result.data.id]);

        // RareTagを1つのツールに紐付け
        await repository.attachToTool('tool3', [tag2Result.data.id]);

        const result = await repository.findAllWithUsageCount();

        expect(result.success).toBe(true);
        if (result.success) {
          const popularTag = result.data.find(t => t.name === 'populartag');
          const rareTag = result.data.find(t => t.name === 'raretag');

          expect(popularTag?.usage_count).toBe(2);
          expect(rareTag?.usage_count).toBe(1);
        }
      }
    });
  });

  describe('attachToTool', () => {
    it('ツールにタグを紐付けできるべき', async () => {
      const toolId = 'attach-test-tool';
      const tag1Result = await repository.create('AttachTag1');
      const tag2Result = await repository.create('AttachTag2');

      if (tag1Result.success && tag2Result.success) {
        const result = await repository.attachToTool(toolId, [
          tag1Result.data.id,
          tag2Result.data.id,
        ]);

        expect(result.success).toBe(true);

        // 検証: 紐付けられたタグを確認
        const tagsResult = await repository.findAllByToolId(toolId);
        if (tagsResult.success) {
          expect(tagsResult.data.length).toBe(2);
        }
      }
    });

    it('既に紐付いているタグの場合はスキップするべき（エラーにしない）', async () => {
      const toolId = 'duplicate-attach-tool';
      const tagResult = await repository.create('DuplicateTag');

      if (tagResult.success) {
        const tagId = tagResult.data.id;

        // 1回目の紐付け
        await repository.attachToTool(toolId, [tagId]);

        // 2回目の紐付け（重複）
        const result = await repository.attachToTool(toolId, [tagId]);

        expect(result.success).toBe(true); // エラーにならない

        // 検証: 1件のみ
        const tagsResult = await repository.findAllByToolId(toolId);
        if (tagsResult.success) {
          expect(tagsResult.data.length).toBe(1);
        }
      }
    });
  });

  describe('detachFromTool', () => {
    it('ツールからタグを削除できるべき', async () => {
      const toolId = 'detach-test-tool';
      const tag1Result = await repository.create('DetachTag1');
      const tag2Result = await repository.create('DetachTag2');

      if (tag1Result.success && tag2Result.success) {
        const tag1Id = tag1Result.data.id;
        const tag2Id = tag2Result.data.id;

        // 2つのタグを紐付け
        await repository.attachToTool(toolId, [tag1Id, tag2Id]);

        // 1つのタグを削除
        const result = await repository.detachFromTool(toolId, [tag1Id]);

        expect(result.success).toBe(true);

        // 検証: 1つのタグのみ残る
        const tagsResult = await repository.findAllByToolId(toolId);
        if (tagsResult.success) {
          expect(tagsResult.data.length).toBe(1);
          expect(tagsResult.data[0].id).toBe(tag2Id);
        }
      }
    });
  });
});
