"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolCard } from "@/components/tools/tool-card";
import { ToolSearchInput } from "@/components/tools/tool-search-input";
import {
  type AITool,
  TOOL_CATEGORIES,
  type AIToolSortBy,
  type SortOrder,
} from "@/lib/schemas/ai-tool.schema";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface ToolsListProps {
  tools: AITool[];
  userMap: Map<string, string>;
  currentUserId: string;
}

type SortOption = `${AIToolSortBy}-${SortOrder}`;

export function ToolsList({ tools, userMap, currentUserId }: ToolsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("usage_date-desc");
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

  // フィルタリングとソート処理
  const filteredAndSortedTools = useMemo(() => {
    let result = [...tools];

    // 1. 検索フィルタ: ツール名、使用目的、使用感で検索（大文字小文字を区別しない）
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter((tool) => {
        const toolName = tool.tool_name.toLowerCase();
        const usagePurpose = tool.usage_purpose.toLowerCase();
        const userExperience = tool.user_experience.toLowerCase();

        return (
          toolName.includes(query) ||
          usagePurpose.includes(query) ||
          userExperience.includes(query)
        );
      });
    }

    // 2. カテゴリフィルタ
    if (selectedCategory !== "all") {
      result = result.filter((tool) => tool.category === selectedCategory);
    }

    // 3. ソート処理
    const [sortBy, sortOrder] = sortOption.split("-") as [
      AIToolSortBy,
      SortOrder,
    ];

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "usage_date":
          comparison =
            new Date(a.usage_date).getTime() -
            new Date(b.usage_date).getTime();
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "created_at":
          comparison =
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [tools, debouncedSearchQuery, selectedCategory, sortOption]);

  return (
    <div className="space-y-6">
      {/* 検索ボックスとローディング表示 */}
      <div className="space-y-2">
        <ToolSearchInput value={searchQuery} onChange={setSearchQuery} />
        {isSearching && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>検索中...</span>
          </div>
        )}
      </div>

      {/* フィルタとソート */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* カテゴリフィルタ */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">カテゴリ:</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {TOOL_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ソート */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">並び順:</label>
            <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usage_date-desc">使用日（新しい順）</SelectItem>
                <SelectItem value="usage_date-asc">使用日（古い順）</SelectItem>
                <SelectItem value="rating-desc">評価（高い順）</SelectItem>
                <SelectItem value="rating-asc">評価（低い順）</SelectItem>
                <SelectItem value="created_at-desc">登録日（新しい順）</SelectItem>
                <SelectItem value="created_at-asc">登録日（古い順）</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 件数表示 */}
        <p className="text-sm text-muted-foreground">
          {debouncedSearchQuery || selectedCategory !== "all"
            ? `表示中: ${filteredAndSortedTools.length}件 / 全${tools.length}件`
            : `登録されているAIツール: ${tools.length}件`}
        </p>
      </div>

      {/* ツール一覧 */}
      {filteredAndSortedTools.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="mb-4 text-muted-foreground">
            {debouncedSearchQuery || selectedCategory !== "all"
              ? "条件に一致するツールが見つかりませんでした"
              : "まだツールが登録されていません"}
          </p>
          {!debouncedSearchQuery && selectedCategory === "all" && (
            <Button asChild>
              <Link href="/tools/new">最初のツールを登録する</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              userName={userMap.get(tool.created_by) || "不明"}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
