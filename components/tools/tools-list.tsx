"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { Loader2, ListChecks, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { bulkDeleteToolsAction, bulkRestoreToolsAction } from "@/lib/actions/ai-tool.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolCard } from "@/components/tools/tool-card";
import { ToolSearchInput } from "@/components/tools/tool-search-input";
import { AdvancedSearchPanel } from "@/components/tools/advanced-search-panel";
import { TagFilter } from "@/components/tools/tag-filter";
import {
  type AITool,
  TOOL_CATEGORIES,
  type AIToolSortBy,
  type SortOrder,
} from "@/lib/schemas/ai-tool.schema";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { SearchService } from "@/lib/services/search.service";
import type { AdvancedSearchConditions } from "@/lib/types/search";

interface ToolsListProps {
  tools: AITool[];
  userMap: Map<string, string>;
  currentUserId: string;
  savedSearchConditions?: AdvancedSearchConditions | null;
}

type SortOption = `${AIToolSortBy}-${SortOrder}`;

export function ToolsList({ tools, userMap, currentUserId, savedSearchConditions }: ToolsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("usage_date-desc");
  const [isSearching, setIsSearching] = useState(false);

  // 高度な検索機能の状態
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedSearchConditions, setAdvancedSearchConditions] = useState<AdvancedSearchConditions | null>(null);
  const searchService = useMemo(() => new SearchService(), []);

  // タグフィルタリングの状態
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 複数選択機能の状態
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  // 高度な検索のハンドラー
  const handleAdvancedSearch = async (conditions: AdvancedSearchConditions) => {
    setAdvancedSearchConditions(conditions);
  };

  // 保存済み検索が適用されたときに検索条件を更新
  useEffect(() => {
    if (savedSearchConditions) {
      setAdvancedSearchConditions(savedSearchConditions);
      setShowAdvancedSearch(true);
    }
  }, [savedSearchConditions]);

  // フィルタリングとソート処理
  const filteredAndSortedTools = useMemo(() => {
    let result = [...tools];

    // 高度な検索が有効な場合
    if (advancedSearchConditions) {
      const searchResult = searchService.advancedSearch(
        advancedSearchConditions,
        tools.map(tool => ({
          id: tool.id,
          tool_name: tool.tool_name,
          category: tool.category,
          rating: tool.rating,
          created_at: tool.created_at,
          usage_date: tool.usage_date,
        }))
      );

      // 同期的に実行（既にクライアント側のデータ）
      Promise.resolve(searchResult).then(res => {
        if (res.success) {
          const toolIds = new Set(res.data.map(t => t.id));
          result = tools.filter(t => toolIds.has(t.id));
        }
      });

      // 即座に適用するために同期処理
      const syncResult = tools.filter(tool => {
        if (!advancedSearchConditions.keyword &&
            (!advancedSearchConditions.category || advancedSearchConditions.category.length === 0) &&
            !advancedSearchConditions.ratingRange &&
            !advancedSearchConditions.dateRange) {
          return true;
        }

        let matches = advancedSearchConditions.operator === 'AND';

        if (advancedSearchConditions.keyword) {
          const keywordMatch = tool.tool_name.toLowerCase().includes(advancedSearchConditions.keyword.toLowerCase());
          matches = advancedSearchConditions.operator === 'AND' ? matches && keywordMatch : matches || keywordMatch;
        }

        if (advancedSearchConditions.category && advancedSearchConditions.category.length > 0) {
          const categoryMatch = advancedSearchConditions.category.includes(tool.category);
          matches = advancedSearchConditions.operator === 'AND' ? matches && categoryMatch : matches || categoryMatch;
        }

        if (advancedSearchConditions.ratingRange) {
          const ratingMatch = tool.rating >= advancedSearchConditions.ratingRange.min &&
                              tool.rating <= advancedSearchConditions.ratingRange.max;
          matches = advancedSearchConditions.operator === 'AND' ? matches && ratingMatch : matches || ratingMatch;
        }

        if (advancedSearchConditions.dateRange) {
          const toolDate = new Date(tool.created_at);
          const dateMatch = toolDate >= advancedSearchConditions.dateRange.start &&
                           toolDate <= advancedSearchConditions.dateRange.end;
          matches = advancedSearchConditions.operator === 'AND' ? matches && dateMatch : matches || dateMatch;
        }

        return matches;
      });

      result = syncResult;
    }
    // 通常の検索とフィルタ
    else {
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

      // 3. タグフィルタ（選択されたタグがすべて含まれるツールのみ表示）
      if (selectedTags.length > 0) {
        result = result.filter((tool) => {
          if (!tool.tags || tool.tags.length === 0) return false;
          // 選択されたすべてのタグが含まれているかチェック（大文字小文字を区別しない）
          return selectedTags.every((selectedTag) =>
            tool.tags!.some((toolTag) => toolTag.toLowerCase() === selectedTag.toLowerCase())
          );
        });
      }
    }

    // 4. ソート処理
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
  }, [tools, debouncedSearchQuery, selectedCategory, sortOption, advancedSearchConditions, searchService, selectedTags]);

  // 複数選択のハンドラー
  const handleToggleSelection = (toolId: string) => {
    setSelectedTools((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(toolId)) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTools.size === filteredAndSortedTools.length) {
      setSelectedTools(new Set());
    } else {
      setSelectedTools(new Set(filteredAndSortedTools.map((tool) => tool.id)));
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedTools(new Set());
  };

  const handleEnterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedTools(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedTools.size === 0) return;
    setShowBulkDeleteDialog(true);
  };

  const handleConfirmBulkDelete = () => {
    startTransition(async () => {
      try {
        const toolIds = Array.from(selectedTools);
        const result = await bulkDeleteToolsAction(toolIds);

        if (!result.success) {
          toast.error("一括削除に失敗しました", {
            description: result.error,
          });
          return;
        }

        toast.success(`${result.data.count}件のツールを削除しました`, {
          description: "30日以内であれば復元できます",
          duration: 10000, // 10秒間表示
          action: {
            label: "元に戻す",
            onClick: async () => {
              // Undo処理を実行
              const restoreResult = await bulkRestoreToolsAction(toolIds);
              
              if (!restoreResult.success) {
                toast.error("削除の取り消しに失敗しました", {
                  description: restoreResult.error,
                });
                return;
              }

              toast.success(`${restoreResult.data.count}件のツールを復元しました`);
            },
          },
        });

        setShowBulkDeleteDialog(false);
        setSelectionMode(false);
        setSelectedTools(new Set());
      } catch (error) {
        console.error("Failed to bulk delete tools:", error);
        toast.error("一括削除中にエラーが発生しました");
      }
    });
  };

  // すべて選択チェックボックスの状態
  const selectAllCheckboxState = 
    selectedTools.size === 0 
      ? false 
      : selectedTools.size === filteredAndSortedTools.length 
      ? true 
      : "indeterminate";

  return (
    <div className="space-y-6">
      {/* 検索ボックスとローディング表示 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ToolSearchInput value={searchQuery} onChange={setSearchQuery} className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          >
            {showAdvancedSearch ? '通常検索' : '高度な検索'}
          </Button>
        </div>
        {isSearching && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>検索中...</span>
          </div>
        )}
      </div>

      {/* 高度な検索パネル */}
      {showAdvancedSearch && (
        <AdvancedSearchPanel
          onSearch={handleAdvancedSearch}
          resultCount={filteredAndSortedTools.length}
        />
      )}

      {/* 選択モード切り替えと選択状態表示 */}
      {!selectionMode ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnterSelectionMode}
          >
            <ListChecks className="mr-2 h-4 w-4" />
            選択
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectAllCheckboxState}
                onCheckedChange={handleSelectAll}
                aria-label="すべて選択"
              />
              <label className="text-sm font-medium cursor-pointer" onClick={handleSelectAll}>
                すべて選択
              </label>
            </div>
            {selectedTools.size > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedTools.size}件選択中
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedTools.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {selectedTools.size}件削除
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelSelection}
            >
              <X className="mr-2 h-4 w-4" />
              キャンセル
            </Button>
          </div>
        </div>
      )}

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

          {/* タグフィルタ */}
          <TagFilter selectedTags={selectedTags} onTagsChange={setSelectedTags} />

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
          {debouncedSearchQuery || selectedCategory !== "all" || selectedTags.length > 0
            ? `表示中: ${filteredAndSortedTools.length}件 / 全${tools.length}件`
            : `登録されているAIツール: ${tools.length}件`}
        </p>
      </div>

      {/* ツール一覧 */}
      {filteredAndSortedTools.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="mb-4 text-muted-foreground">
            {debouncedSearchQuery || selectedCategory !== "all" || selectedTags.length > 0
              ? "条件に一致するツールが見つかりませんでした"
              : "まだツールが登録されていません"}
          </p>
          {!debouncedSearchQuery && selectedCategory === "all" && selectedTags.length === 0 && (
            <Button asChild>
              <Link href="/tools/new">最初のツールを登録する</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              userName={userMap.get(tool.created_by) || "不明"}
              currentUserId={currentUserId}
              selectionMode={selectionMode}
              isSelected={selectedTools.has(tool.id)}
              onToggleSelection={() => handleToggleSelection(tool.id)}
            />
          ))}
        </div>
      )}

      {/* 一括削除確認ダイアログ */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>一括削除の確認</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>選択した{selectedTools.size}件のツールを削除してもよろしいですか？</p>
                
                {/* 削除対象のプレビュー */}
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2 max-h-60 overflow-y-auto">
                  <p className="text-sm font-medium text-foreground">削除対象:</p>
                  <ul className="text-sm text-foreground space-y-1">
                    {Array.from(selectedTools).map((toolId) => {
                      const tool = filteredAndSortedTools.find((t) => t.id === toolId);
                      return tool ? (
                        <li key={toolId} className="flex items-center gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{tool.tool_name}</span>
                          <span className="text-muted-foreground">({tool.category})</span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground">
                  削除後30日以内であれば復元できます。30日を過ぎると自動的に完全削除されます。
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmBulkDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "削除中..." : `${selectedTools.size}件削除する`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
