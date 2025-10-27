"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptHistoryCard } from "@/components/prompt/prompt-history-card";
import { ToolSearchInput } from "@/components/tools/tool-search-input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { PromptHistory } from "@/lib/schemas/prompt.schema";

interface PromptHistoryListProps {
  histories: PromptHistory[];
  userMap: Map<string, string>;
}

export function PromptHistoryList({
  histories,
  userMap,
}: PromptHistoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // デバウンス処理: 300ms後に検索を実行
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 検索中のローディング状態を管理
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  // フィルタリング処理: プロンプトテキストと入力パラメータで検索
  const filteredHistories = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return histories;
    }

    const query = debouncedSearchQuery.toLowerCase();

    return histories.filter((history) => {
      // プロンプトテキストで検索
      const promptText = history.generated_prompt.toLowerCase();
      if (promptText.includes(query)) return true;

      // 入力パラメータで検索
      const params = history.input_params;
      if (params?.purpose?.toLowerCase().includes(query)) return true;
      if (params?.sceneDescription?.toLowerCase().includes(query)) return true;
      if (params?.style?.toLowerCase().includes(query)) return true;
      if (params?.additionalRequirements?.toLowerCase().includes(query))
        return true;

      return false;
    });
  }, [histories, debouncedSearchQuery]);

  return (
    <div className="space-y-6">
      {/* 検索ボックスとローディング表示 */}
      <div className="space-y-2">
        <ToolSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="プロンプトや入力パラメータで検索..."
        />
        {isSearching && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>検索中...</span>
          </div>
        )}
      </div>

      {/* 件数表示 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {debouncedSearchQuery
            ? `検索結果: ${filteredHistories.length}件 / 全${histories.length}件`
            : `生成したプロンプト: ${histories.length}件`}
        </p>
      </div>

      {/* 履歴一覧 */}
      {filteredHistories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="mb-4 text-muted-foreground">
            {debouncedSearchQuery
              ? "検索結果が見つかりませんでした"
              : "まだプロンプトが保存されていません"}
          </p>
          {!debouncedSearchQuery && (
            <Button asChild>
              <Link href="/prompt">プロンプトを生成する</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredHistories.map((history) => (
            <PromptHistoryCard
              key={history.id}
              history={history}
              userName={userMap.get(history.user_id) || "不明"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
