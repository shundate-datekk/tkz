/**
 * 保存済み検索の型定義
 * Requirements: 11.3, 11.4
 */

import type { AdvancedSearchConditions } from './search';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  conditions: AdvancedSearchConditions;
  created_at: string;
}

export interface CreateSavedSearchData {
  user_id: string;
  name: string;
  conditions: AdvancedSearchConditions;
}
