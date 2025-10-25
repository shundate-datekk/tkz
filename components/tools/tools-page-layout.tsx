/**
 * ToolsPageLayout コンポーネント
 * AIツール一覧ページのレイアウト（サイドバー付き）
 * Requirements: 11.4
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SavedSearchList } from '@/components/search/saved-search-list';
import type { AdvancedSearchConditions } from '@/lib/types/search';

interface ToolsPageLayoutProps {
  children: React.ReactNode;
  onSearchConditionsChange?: (conditions: AdvancedSearchConditions | null) => void;
}

export function ToolsPageLayout({
  children,
  onSearchConditionsChange,
}: ToolsPageLayoutProps) {
  const handleSelectSearch = (conditions: AdvancedSearchConditions) => {
    if (onSearchConditionsChange) {
      onSearchConditionsChange(conditions);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* サイドバー（デスクトップのみ表示） */}
      <aside className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">保存済み検索</CardTitle>
          </CardHeader>
          <CardContent>
            <SavedSearchList onSelectSearch={handleSelectSearch} />
          </CardContent>
        </Card>
      </aside>

      {/* メインコンテンツ */}
      <div>{children}</div>
    </div>
  );
}
