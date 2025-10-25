/**
 * 検索サービス
 * 高度な検索ロジックを提供
 * Requirements: 11.1, 11.2
 */

import type { AdvancedSearchConditions, SearchResult } from '@/lib/types/search';

export class SearchService {
  /**
   * 高度な検索を実行
   */
  async advancedSearch(
    conditions: AdvancedSearchConditions,
    tools: SearchResult[]
  ): Promise<{ success: true; data: SearchResult[] } | { success: false; error: string }> {
    try {
      let results = [...tools];

      // AND条件の場合は各フィルタを順次適用
      if (conditions.operator === 'AND') {
        // キーワード検索
        if (conditions.keyword) {
          const keyword = conditions.keyword.toLowerCase();
          results = results.filter(tool =>
            tool.tool_name.toLowerCase().includes(keyword)
          );
        }

        // カテゴリーフィルタ
        if (conditions.category && conditions.category.length > 0) {
          results = results.filter(tool =>
            conditions.category!.includes(tool.category)
          );
        }

        // 評価範囲フィルタ
        if (conditions.ratingRange) {
          const { min, max } = conditions.ratingRange;
          results = results.filter(tool =>
            tool.rating >= min && tool.rating <= max
          );
        }

        // 日付範囲フィルタ
        if (conditions.dateRange) {
          const { start, end } = conditions.dateRange;
          results = results.filter(tool => {
            const toolDate = new Date(tool.created_at);
            return toolDate >= start && toolDate <= end;
          });
        }
      }
      // OR条件の場合は各フィルタの結果をマージ
      else if (conditions.operator === 'OR') {
        const matchedIds = new Set<string>();

        // キーワード検索
        if (conditions.keyword) {
          const keyword = conditions.keyword.toLowerCase();
          tools
            .filter(tool => tool.tool_name.toLowerCase().includes(keyword))
            .forEach(tool => matchedIds.add(tool.id));
        }

        // カテゴリーフィルタ
        if (conditions.category && conditions.category.length > 0) {
          tools
            .filter(tool => conditions.category!.includes(tool.category))
            .forEach(tool => matchedIds.add(tool.id));
        }

        // 評価範囲フィルタ
        if (conditions.ratingRange) {
          const { min, max } = conditions.ratingRange;
          tools
            .filter(tool => tool.rating >= min && tool.rating <= max)
            .forEach(tool => matchedIds.add(tool.id));
        }

        // 日付範囲フィルタ
        if (conditions.dateRange) {
          const { start, end } = conditions.dateRange;
          tools
            .filter(tool => {
              const toolDate = new Date(tool.created_at);
              return toolDate >= start && toolDate <= end;
            })
            .forEach(tool => matchedIds.add(tool.id));
        }

        // フィルタが全く指定されていない場合は全件返す
        if (matchedIds.size === 0 && !conditions.keyword && !conditions.category && !conditions.ratingRange && !conditions.dateRange) {
          results = tools;
        } else {
          results = tools.filter(tool => matchedIds.has(tool.id));
        }
      }

      return { success: true, data: results };
    } catch (error) {
      console.error('Advanced search error:', error);
      return { success: false, error: '検索中にエラーが発生しました' };
    }
  }

  /**
   * 検索結果の件数を取得
   */
  getResultCount(results: SearchResult[]): number {
    return results.length;
  }
}
