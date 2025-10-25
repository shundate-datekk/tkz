"use client";

import useSWR, { mutate } from "swr";
import { getToolsAction, type Tool } from "@/lib/actions/ai-tool.actions";

/**
 * SWR fetcher for AI tools list
 */
async function toolsFetcher(): Promise<Tool[]> {
  const result = await getToolsAction();
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data;
}

/**
 * SWR hook for AI tools list with caching and revalidation
 */
export function useTools() {
  const { data, error, isLoading, isValidating } = useSWR<Tool[]>(
    "/api/tools",
    toolsFetcher,
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
    tools: data || [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    
    /**
     * Manually revalidate tools list
     */
    refresh: () => mutate("/api/tools"),
    
    /**
     * Update cache optimistically when creating a new tool
     */
    addToolOptimistic: (newTool: Tool) => {
      mutate(
        "/api/tools",
        (currentTools: Tool[] = []) => [newTool, ...currentTools],
        { revalidate: false }
      );
    },
    
    /**
     * Update cache optimistically when updating a tool
     */
    updateToolOptimistic: (updatedTool: Tool) => {
      mutate(
        "/api/tools",
        (currentTools: Tool[] = []) =>
          currentTools.map((tool) =>
            tool.id === updatedTool.id ? updatedTool : tool
          ),
        { revalidate: false }
      );
    },
    
    /**
     * Update cache optimistically when deleting a tool
     */
    deleteToolOptimistic: (toolId: string) => {
      mutate(
        "/api/tools",
        (currentTools: Tool[] = []) =>
          currentTools.filter((tool) => tool.id !== toolId),
        { revalidate: false }
      );
    },
    
    /**
     * Update cache optimistically when toggling like
     */
    toggleLikeOptimistic: (toolId: string, liked: boolean, likeCount: number) => {
      mutate(
        "/api/tools",
        (currentTools: Tool[] = []) =>
          currentTools.map((tool) =>
            tool.id === toolId
              ? { ...tool, liked, like_count: likeCount }
              : tool
          ),
        { revalidate: false }
      );
    },
  };
}

/**
 * Key for manual cache invalidation
 */
export const TOOLS_CACHE_KEY = "/api/tools";

/**
 * Manually invalidate tools cache
 */
export async function invalidateToolsCache() {
  await mutate(TOOLS_CACHE_KEY);
}
