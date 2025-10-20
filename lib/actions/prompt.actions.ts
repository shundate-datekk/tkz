"use server";

import { revalidatePath } from "next/cache";
import { promptGenerationService } from "@/lib/services/prompt-generation.service";
import { promptHistoryService } from "@/lib/services/prompt-history.service";
import { getCurrentUserId } from "@/lib/auth/helpers";
import type { GeneratePromptInput } from "@/lib/schemas/prompt.schema";
import type { AppError } from "@/lib/types/result";

/**
 * Server Action結果型
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * プロンプト生成のServer Action
 */
export async function generatePromptAction(
  input: GeneratePromptInput
): Promise<ActionResult<{ promptText: string; inputParameters: any }>> {
  try {
    const result = await promptGenerationService.generatePrompt(input);

    if (!result.success) {
      const error = result.error as AppError;
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Generate prompt action error:", error);
    return {
      success: false,
      error: "プロンプトの生成中にエラーが発生しました",
    };
  }
}

/**
 * プロンプト再生成のServer Action
 */
export async function regeneratePromptAction(
  input: GeneratePromptInput
): Promise<ActionResult<{ promptText: string; inputParameters: any }>> {
  try {
    const result = await promptGenerationService.regeneratePrompt(input);

    if (!result.success) {
      const error = result.error as AppError;
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Regenerate prompt action error:", error);
    return {
      success: false,
      error: "プロンプトの再生成中にエラーが発生しました",
    };
  }
}

/**
 * プロンプト履歴保存のServer Action
 */
export async function savePromptHistoryAction(
  promptText: string,
  inputParameters: GeneratePromptInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "認証が必要です",
      };
    }

    const result = await promptHistoryService.savePromptHistory({
      prompt_text: promptText,
      input_parameters: inputParameters as any,
      created_by: userId,
    });

    if (!result.success) {
      const error = result.error as AppError;
      return {
        success: false,
        error: error.message,
      };
    }

    // 履歴ページをリバリデート
    revalidatePath("/history");

    return {
      success: true,
      data: { id: result.data.id },
    };
  } catch (error) {
    console.error("Save prompt history action error:", error);
    return {
      success: false,
      error: "プロンプト履歴の保存中にエラーが発生しました",
    };
  }
}

/**
 * プロンプト履歴削除のServer Action
 */
export async function deletePromptHistoryAction(
  historyId: string
): Promise<ActionResult<boolean>> {
  try {
    const result = await promptHistoryService.deletePromptHistory(historyId);

    if (!result.success) {
      const error = result.error as AppError;
      return {
        success: false,
        error: error.message,
      };
    }

    // 履歴ページをリバリデート
    revalidatePath("/history");

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("Delete prompt history action error:", error);
    return {
      success: false,
      error: "プロンプト履歴の削除中にエラーが発生しました",
    };
  }
}
