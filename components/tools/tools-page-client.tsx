/**
 * ToolsPageClient コンポーネント
 * ツール一覧ページのクライアント側実装（保存済み検索統合）
 * Requirements: 11.4
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SavedSearchList } from '@/components/search/saved-search-list';
import { ToolsList } from '@/components/tools/tools-list';
import type { AITool } from '@/lib/schemas/ai-tool.schema';
import type { AdvancedSearchConditions } from '@/lib/types/search';

interface ToolsPageClientProps {
  tools: AITool[];
  userMap: Map<string, string>;
  currentUserId: string;
}

export function ToolsPageClient({
  tools,
  userMap,
  currentUserId,
}: ToolsPageClientProps) {
  const [savedSearchConditions, setSavedSearchConditions] =
    useState<AdvancedSearchConditions | null>(null);

  const handleSelectSearch = (conditions: AdvancedSearchConditions) => {
    setSavedSearchConditions(conditions);
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
      <div>
        <ToolsList
          tools={tools}
          userMap={userMap}
          currentUserId={currentUserId}
          savedSearchConditions={savedSearchConditions}
        />
      </div>
    </div>
  );
}
