"use client";

import useSWR from "swr";
import type { AITool, AIToolFilter, AIToolSortBy, SortOrder } from "@/lib/schemas/ai-tool.schema";

/**
 * AIツール取得のフェッチャー関数
 */
async function fetchAITools(url: string): Promise<AITool[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch AI tools");
  }
  const data = await response.json();
  return data.success ? data.data : [];
}

/**
 * AIツール一覧を取得するSWRフック
 *
 * @param filter - フィルタ条件
 * @param sortBy - ソート項目
 * @param sortOrder - ソート順序
 * @returns AIツール一覧とSWR状態
 *
 * @example
 * ```tsx
 * const { tools, isLoading, error, mutate } = useAITools({
 *   category: "画像生成",
 *   rating: 5
 * });
 * ```
 */
export function useAITools(
  filter?: AIToolFilter,
  sortBy: AIToolSortBy = "usage_date",
  sortOrder: SortOrder = "desc"
) {
  const params = new URLSearchParams();

  if (filter?.category) params.append("category", filter.category);
  if (filter?.rating) params.append("rating", filter.rating.toString());
  if (filter?.created_by) params.append("created_by", filter.created_by);
  if (filter?.search) params.append("search", filter.search);
  params.append("sortBy", sortBy);
  params.append("sortOrder", sortOrder);

  const { data, error, isLoading, mutate, isValidating } = useSWR<AITool[]>(
    `/api/ai-tools?${params.toString()}`,
    fetchAITools,
    {
      // 5分間キャッシュ
      dedupingInterval: 5 * 60 * 1000,
      // フォーカス時に再検証
      revalidateOnFocus: true,
      // 再接続時に再検証
      revalidateOnReconnect: true,
      // エラー時の再試行設定
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  return {
    tools: data ?? [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

/**
 * 特定のAIツールを取得するSWRフック
 *
 * @param toolId - AIツールID
 * @returns AIツールとSWR状態
 *
 * @example
 * ```tsx
 * const { tool, isLoading, error, mutate } = useAITool("tool-123");
 * ```
 */
export function useAITool(toolId: string | null) {
  const { data, error, isLoading, mutate, isValidating } = useSWR<AITool | null>(
    toolId ? `/api/ai-tools/${toolId}` : null,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch AI tool");
      }
      const data = await response.json();
      return data.success ? data.data : null;
    },
    {
      // 10分間キャッシュ（詳細ページは更新頻度が低い）
      dedupingInterval: 10 * 60 * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    tool: data ?? null,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

/**
 * ユーザーが作成したAIツール一覧を取得するSWRフック
 *
 * @param userId - ユーザーID
 * @returns AIツール一覧とSWR状態
 *
 * @example
 * ```tsx
 * const { tools, isLoading, error, mutate } = useUserAITools("user-123");
 * ```
 */
export function useUserAITools(userId: string | null) {
  const { data, error, isLoading, mutate, isValidating } = useSWR<AITool[]>(
    userId ? `/api/ai-tools?created_by=${userId}` : null,
    fetchAITools,
    {
      dedupingInterval: 3 * 60 * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    tools: data ?? [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
