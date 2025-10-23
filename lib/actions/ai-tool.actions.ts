"use server";

import { revalidatePath } from "next/cache";
import { aiToolService } from "@/lib/services/ai-tool.service";
import { getCurrentUserId } from "@/lib/auth/helpers";
import type {
  CreateAIToolInput,
  UpdateAIToolInput,
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
