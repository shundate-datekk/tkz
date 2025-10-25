/**
 * 高度な検索サービスのテスト
 * Requirements: 11.1, 11.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchService } from '../search.service';
import type { AdvancedSearchConditions } from '@/lib/types/search';

// モックデータ
const mockTools = [
  {
    id: '1',
    tool_name: 'ChatGPT',
    category: 'text',
    rating: 5,
    created_at: '2025-01-15T00:00:00Z',
    usage_date: '2025-01-15T00:00:00Z',
  },
  {
    id: '2',
    tool_name: 'DALL-E',
    category: 'image',
    rating: 4,
    created_at: '2024-12-01T00:00:00Z',
    usage_date: '2024-12-01T00:00:00Z',
  },
  {
    id: '3',
    tool_name: 'Midjourney',
    category: 'image',
    rating: 5,
    created_at: '2024-11-10T00:00:00Z',
    usage_date: '2024-11-10T00:00:00Z',
  },
];

describe('SearchService', () => {
  let searchService: SearchService;

  beforeEach(() => {
    searchService = new SearchService();
  });

  describe('advancedSearch', () => {
    it('キーワード検索で結果を返すべき', async () => {
      const conditions: AdvancedSearchConditions = {
        keyword: 'Chat',
        operator: 'AND',
      };

      const result = await searchService.advancedSearch(conditions, mockTools);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].tool_name).toBe('ChatGPT');
      }
    });

    it('カテゴリーフィルタで結果を絞り込むべき', async () => {
      const conditions: AdvancedSearchConditions = {
        operator: 'AND',
        category: ['image'],
      };

      const result = await searchService.advancedSearch(conditions, mockTools);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(2);
        expect(result.data.every(t => t.category === 'image')).toBe(true);
      }
    });

    it('評価範囲フィルタで結果を絞り込むべき', async () => {
      const conditions: AdvancedSearchConditions = {
        operator: 'AND',
        ratingRange: { min: 5, max: 5 },
      };

      const result = await searchService.advancedSearch(conditions, mockTools);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(2);
        expect(result.data.every(t => t.rating === 5)).toBe(true);
      }
    });

    it('日付範囲フィルタで結果を絞り込むべき', async () => {
      const conditions: AdvancedSearchConditions = {
        operator: 'AND',
        dateRange: {
          start: new Date('2025-01-01'),
          end: new Date('2025-12-31'),
        },
      };

      const result = await searchService.advancedSearch(conditions, mockTools);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].tool_name).toBe('ChatGPT');
      }
    });

    it('AND条件で複数フィルタを組み合わせるべき', async () => {
      const conditions: AdvancedSearchConditions = {
        operator: 'AND',
        category: ['image'],
        ratingRange: { min: 5, max: 5 },
      };

      const result = await searchService.advancedSearch(conditions, mockTools);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(1);
        expect(result.data[0].tool_name).toBe('Midjourney');
      }
    });

    it('OR条件で複数フィルタを組み合わせるべき', async () => {
      const conditions: AdvancedSearchConditions = {
        operator: 'OR',
        keyword: 'ChatGPT',
        category: ['image'],
      };

      const result = await searchService.advancedSearch(conditions, mockTools);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(3); // ChatGPT + 2 image tools
      }
    });

    it('結果がない場合は空配列を返すべき', async () => {
      const conditions: AdvancedSearchConditions = {
        operator: 'AND',
        keyword: 'NonExistent',
      };

      const result = await searchService.advancedSearch(conditions, mockTools);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(0);
      }
    });

    it('条件が空の場合は全件を返すべき', async () => {
      const conditions: AdvancedSearchConditions = {
        operator: 'AND',
      };

      const result = await searchService.advancedSearch(conditions, mockTools);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(3);
      }
    });
  });

  describe('getResultCount', () => {
    it('検索結果の件数を返すべき', () => {
      const count = searchService.getResultCount(mockTools);
      expect(count).toBe(3);
    });

    it('空配列の場合は0を返すべき', () => {
      const count = searchService.getResultCount([]);
      expect(count).toBe(0);
    });
  });
});
