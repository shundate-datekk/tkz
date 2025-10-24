"use server";

import { revalidatePath } from "next/cache";
import { aiToolService } from "@/lib/services/ai-tool.service";
import { getCurrentUserId } from "@/lib/auth/helpers";
import type {
  CreateAIToolInput,
  UpdateAIToolInput,
  AITool,
} from "@/lib/schemas/ai-tool.schema";
import type { AppError } from "@/lib/types/result";

/**
 * Server Action結果の型
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * AIツールを作成
 */
export async function createToolAction(
  input: CreateAIToolInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await getCurrentUserId();
    const result = await aiToolService.createTool(input, userId);

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    // ツール一覧ページをキャッシュ再検証
    revalidatePath("/tools");

    return {
      success: true,
      data: { id: result.data.id },
    };
  } catch (error) {
    console.error("Failed to create tool:", error);
    return {
      success: false,
      error: "ツールの登録中にエラーが発生しました",
    };
  }
}

/**
 * AIツールを更新
 */
export async function updateToolAction(
  id: string,
  input: UpdateAIToolInput
): Promise<ActionResult<void>> {
  try {
    const userId = await getCurrentUserId();
    const result = await aiToolService.updateTool(id, input, userId);

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    // ツール一覧とツール詳細ページをキャッシュ再検証
    revalidatePath("/tools");
    revalidatePath(`/tools/${id}`);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Failed to update tool:", error);
    return {
      success: false,
      error: "ツールの更新中にエラーが発生しました",
    };
  }
}

/**
 * AIツールを削除
 */
export async function deleteToolAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    const userId = await getCurrentUserId();
    const result = await aiToolService.deleteTool(id, userId);

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    // ツール一覧とツール詳細ページをキャッシュ再検証
    revalidatePath("/tools");
    revalidatePath(`/tools/${id}`);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Failed to delete tool:", error);
    return {
      success: false,
      error: "ツールの削除中にエラーが発生しました",
    };
  }
}

/**
 * 論理削除されたツールを取得（30日以内）
 */
export async function getDeletedToolsAction(): Promise<
  ActionResult<any[]>
> {
  try {
    const userId = await getCurrentUserId();
    const result = await aiToolService.getDeletedTools(userId);

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Failed to get deleted tools:", error);
    return {
      success: false,
      error: "削除されたツールの取得中にエラーが発生しました",
    };
  }
}

/**
 * 論理削除されたツールを復元
 */
export async function restoreToolAction(
  id: string
): Promise<ActionResult<void>> {
  try {
    const userId = await getCurrentUserId();
    const result = await aiToolService.restoreTool(id, userId);

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    // ツール一覧ページをキャッシュ再検証
    revalidatePath("/tools");
    revalidatePath(`/tools/${id}`);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Failed to restore tool:", error);
    return {
      success: false,
      error: "ツールの復元中にエラーが発生しました",
    };
  }
}

/**
 * 複数の論理削除されたツールを一括復元
 */
export async function bulkRestoreToolsAction(
  toolIds: string[]
): Promise<ActionResult<{ count: number }>> {
  try {
    const userId = await getCurrentUserId();
    
    let successCount = 0;
    const errors: string[] = [];

    // 各ツールを順番に復元
    for (const toolId of toolIds) {
      const result = await aiToolService.restoreTool(toolId, userId);
      if (result.success) {
        successCount++;
      } else {
        errors.push(`${toolId}: ${result.error.message}`);
      }
    }

    // ツール一覧ページをキャッシュ再検証
    revalidatePath("/tools");

    if (errors.length > 0) {
      return {
        success: false,
        error: `${successCount}/${toolIds.length}件復元しました。エラー: ${errors.join(", ")}`,
      };
    }

    return {
      success: true,
      data: { count: successCount },
    };
  } catch (error) {
    console.error("Failed to bulk restore tools:", error);
    return {
      success: false,
      error: "一括復元中にエラーが発生しました",
    };
  }
}

/**
 * 複数のAIツールを一括削除
 */
export async function bulkDeleteToolsAction(
  toolIds: string[]
): Promise<ActionResult<{ count: number }>> {
  try {
    const userId = await getCurrentUserId();
    
    let successCount = 0;
    const errors: string[] = [];

    // 各ツールを順番に削除
    for (const toolId of toolIds) {
      const result = await aiToolService.deleteTool(toolId, userId);
      if (result.success) {
        successCount++;
      } else {
        errors.push(`${toolId}: ${result.error.message}`);
      }
    }

    // ツール一覧ページをキャッシュ再検証
    revalidatePath("/tools");

    if (errors.length > 0) {
      return {
        success: false,
        error: `${successCount}/${toolIds.length}件削除しました。エラー: ${errors.join(", ")}`,
      };
    }

    return {
      success: true,
      data: { count: successCount },
    };
  } catch (error) {
    console.error("Failed to bulk delete tools:", error);
    return {
      success: false,
      error: "一括削除中にエラーが発生しました",
    };
  }
}

/**
 * 検索キーワードでAIツールを検索
 * グローバル検索で使用する
 */
export async function searchToolsAction(
  query: string
): Promise<ActionResult<AITool[]>> {
  try {
    const userId = await getCurrentUserId();
    
    // 空のクエリの場合は空配列を返す
    if (!query.trim()) {
      return {
        success: true,
        data: [],
      };
    }

    const result = await aiToolService.getAllTools();

    if (!result.success) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    // クライアント側でフィルタリング（tool_name, usage_purpose, user_experienceで検索）
    const searchQuery = query.toLowerCase();
    const filteredTools = result.data.filter((tool) => {
      const toolName = tool.tool_name.toLowerCase();
      const usagePurpose = tool.usage_purpose.toLowerCase();
      const userExperience = tool.user_experience.toLowerCase();
      const category = tool.category.toLowerCase();

      return (
        toolName.includes(searchQuery) ||
        usagePurpose.includes(searchQuery) ||
        userExperience.includes(searchQuery) ||
        category.includes(searchQuery)
      );
    });

    // 最大10件に制限
    return {
      success: true,
      data: filteredTools.slice(0, 10),
    };
  } catch (error) {
    console.error("Failed to search tools:", error);
    return {
      success: false,
      error: "ツールの検索中にエラーが発生しました",
    };
  }
}
