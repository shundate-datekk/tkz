/**
 * 検索機能の型定義
 */

export interface AdvancedSearchConditions {
  keyword?: string;
  operator: 'AND' | 'OR';
  category?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  ratingRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
}

export interface SearchResult {
  id: string;
  tool_name: string;
  category: string;
  rating: number;
  created_at: string;
  usage_date: string;
  [key: string]: unknown;
}
