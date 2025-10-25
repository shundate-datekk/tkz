/**
 * AISearchService のテスト
 * Requirements: 11.7, 11.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AISearchService } from '../ai-search.service';
import type { SearchResult } from '@/lib/types/search';

// OpenAI クライアントのモック
vi.mock('@/lib/clients/openai-client', () => ({
  OpenAIClient: vi.fn().mockImplementation(() => ({
    chat: vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              keywords: ['画像', '生成'],
              category: 'image',
              minRating: 4,
              dateRange: 'last_year',
            }),
          },
        },
      ],
    }),
  })),
}));

describe('AISearchService', () => {
  let service: AISearchService;
  const mockTools: SearchResult[] = [
    {
      id: '1',
      tool_name: 'ChatGPT',
      category: 'text',
      rating: 5,
      created_at: '2024-01-01T00:00:00Z',
      usage_date: '2024-01-15T00:00:00Z',
      description: 'AI対話ツール',
    },
    {
      id: '2',
      tool_name: 'DALL-E',
      category: 'image',
      rating: 4,
      created_at: '2024-01-05T00:00:00Z',
      usage_date: '2024-01-20T00:00:00Z',
      description: '画像生成AI',
    },
    {
      id: '3',
      tool_name: 'Sora',
      category: 'video',
      rating: 5,
      created_at: '2024-01-10T00:00:00Z',
      usage_date: '2024-01-25T00:00:00Z',
      description: '動画生成AI',
    },
  ];

  beforeEach(() => {
    service = new AISearchService();
  });

  describe('naturalLanguageSearch', () => {
    it('自然言語クエリを構造化検索に変換して結果を返すべき', async () => {
      const query = '去年使った画像生成ツール';

      const result = await service.naturalLanguageSearch(query, mockTools);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0]).toHaveProperty('relevanceScore');
        expect(result.data[0].relevanceScore).toBeGreaterThanOrEqual(0);
        expect(result.data[0].relevanceScore).toBeLessThanOrEqual(100);
      }
    });

    it('関連度スコア降順でソートされるべき', async () => {
      const query = '高評価のテキスト生成ツール';

      const result = await service.naturalLanguageSearch(query, mockTools);

      expect(result.success).toBe(true);
      if (result.success) {
        // スコアが降順になっているか確認
        for (let i = 0; i < result.data.length - 1; i++) {
          expect(result.data[i].relevanceScore).toBeGreaterThanOrEqual(
            result.data[i + 1].relevanceScore
          );
        }
      }
    });

    it('OpenAI API失敗時は通常のキーワード検索にフォールバックするべき', async () => {
      // OpenAI APIエラーをシミュレート
      const service = new AISearchService();
      vi.spyOn(service as any, 'extractIntentWithOpenAI').mockRejectedValue(
        new Error('OpenAI API Error')
      );

      const query = 'ChatGPT';
      const result = await service.naturalLanguageSearch(query, mockTools);

      expect(result.success).toBe(true);
      if (result.success) {
        // フォールバック検索でもChatGPTがヒットするべき
        const chatgptResult = result.data.find(r => r.tool_name === 'ChatGPT');
        expect(chatgptResult).toBeDefined();
      }
    });

    it('空のクエリの場合はエラーを返すべき', async () => {
      const result = await service.naturalLanguageSearch('', mockTools);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('クエリ');
      }
    });
  });

  describe('extractIntentWithOpenAI', () => {
    it('自然言語から検索意図を抽出できるべき', async () => {
      const query = '最近使った評価が高い画像生成ツール';

      const intent = await (service as any).extractIntentWithOpenAI(query);

      expect(intent).toBeDefined();
      expect(intent.keywords).toBeDefined();
      expect(intent.category).toBeDefined();
      expect(intent.minRating).toBeDefined();
    });
  });

  describe('calculateRelevanceScore', () => {
    it('キーワードマッチで関連度スコアを計算できるべき', () => {
      const tool: SearchResult = {
        id: '1',
        tool_name: 'ChatGPT',
        category: 'text',
        rating: 5,
        created_at: '2024-01-01T00:00:00Z',
        usage_date: '2024-01-15T00:00:00Z',
        description: 'AI対話ツール、テキスト生成に最適',
      };

      const score = (service as any).calculateRelevanceScore(tool, {
        keywords: ['ChatGPT', 'テキスト'],
        category: 'text',
        minRating: 4,
      });

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('完全一致は部分一致より高いスコアになるべき', () => {
      const tool: SearchResult = {
        id: '1',
        tool_name: 'ChatGPT',
        category: 'text',
        rating: 5,
        created_at: '2024-01-01T00:00:00Z',
        usage_date: '2024-01-15T00:00:00Z',
        description: 'AI対話ツール',
      };

      const exactScore = (service as any).calculateRelevanceScore(tool, {
        keywords: ['ChatGPT'],
        category: 'text',
      });

      const partialScore = (service as any).calculateRelevanceScore(tool, {
        keywords: ['Chat'],
        category: 'text',
      });

      expect(exactScore).toBeGreaterThan(partialScore);
    });
  });
});
