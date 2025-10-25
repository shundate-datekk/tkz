"use client";

import useSWR, { mutate } from "swr";
import { getPromptHistoriesAction, searchPromptHistoriesAction } from "@/lib/actions/prompt.actions";
import type { PromptHistory } from "@/lib/schemas/prompt.schema";

/**
 * SWR fetcher for prompt histories list
 */
async function promptHistoriesFetcher(): Promise<PromptHistory[]> {
  const result = await getPromptHistoriesAction({
    orderBy: "created_at",
    order: "desc",
    limit: 50,
  });
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data;
}

/**
 * SWR hook for prompt histories list with caching and revalidation
 */
export function usePromptHistory() {
  const { data, error, isLoading, isValidating } = useSWR<PromptHistory[]>(
    "/api/prompt-histories",
    promptHistoriesFetcher,
    {
      // Background revalidation settings
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // Prevent duplicate requests within 2 seconds
      
      // Cache configuration
      revalidateIfStale: true,
      keepPreviousData: true, // Keep previous data while fetching new data
      
      // Error retry configuration
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      shouldRetryOnError: true,
      
      // Fallback to empty array if no data
      fallbackData: [],
    }
  );

  return {
    histories: data || [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    
    /**
     * Manually revalidate histories list
     */
    refresh: () => mutate("/api/prompt-histories"),
    
    /**
     * Update cache optimistically when saving a new history
     */
    addHistoryOptimistic: (newHistory: PromptHistory) => {
      mutate(
        "/api/prompt-histories",
        (currentHistories: PromptHistory[] = []) => [newHistory, ...currentHistories],
        { revalidate: false }
      );
    },
    
    /**
     * Update cache optimistically when deleting a history
     */
    deleteHistoryOptimistic: (historyId: string) => {
      mutate(
        "/api/prompt-histories",
        (currentHistories: PromptHistory[] = []) =>
          currentHistories.filter((history) => history.id !== historyId),
        { revalidate: false }
      );
    },
  };
}

/**
 * SWR fetcher for prompt history search
 */
async function promptHistorySearchFetcher(keyword: string): Promise<PromptHistory[]> {
  const result = await searchPromptHistoriesAction(keyword, {
    limit: 50,
  });
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data;
}

/**
 * SWR hook for prompt history search
 */
export function usePromptHistorySearch(keyword: string) {
  const { data, error, isLoading, isValidating } = useSWR<PromptHistory[]>(
    keyword ? ["/api/prompt-histories/search", keyword] : null,
    () => promptHistorySearchFetcher(keyword),
    {
      // Background revalidation settings
      revalidateOnFocus: false, // Don't revalidate on focus for search
      revalidateOnReconnect: false,
      dedupingInterval: 2000,
      
      // Cache configuration
      revalidateIfStale: false,
      keepPreviousData: true,
      
      // Error retry configuration
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      shouldRetryOnError: true,
      
      // Fallback to empty array if no data
      fallbackData: [],
    }
  );

  return {
    searchResults: data || [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
  };
}

/**
 * Key for manual cache invalidation
 */
export const PROMPT_HISTORY_CACHE_KEY = "/api/prompt-histories";

/**
 * Manually invalidate prompt history cache
 */
export async function invalidatePromptHistoryCache() {
  await mutate(PROMPT_HISTORY_CACHE_KEY);
}
