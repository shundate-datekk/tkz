"use server";

import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";
import type { AITool } from "@/lib/schemas/ai-tool.schema";

/**
 * データエクスポートのレスポンス型
 */
interface ExportDataResponse {
  success: boolean;
  data?: {
    tools: AITool[];
    exportedAt: string;
    totalCount: number;
  };
  error?: string;
}

/**
 * データインポートのレスポンス型
 */
interface ImportDataResponse {
  success: boolean;
  data?: {
    importedCount: number;
    skippedCount: number;
    errors: string[];
  };
  error?: string;
}

/**
 * 全AIツールデータをエクスポートする
 * JSON形式で返却し、クライアント側でダウンロード処理を行う
 *
 * Requirements: 10.1, 10.2
 */
export async function exportToolsDataAction(): Promise<ExportDataResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "認証が必要です",
      };
    }

    // 現在のユーザーが作成したツールをすべて取得
    const { data: tools, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("created_by", session.user.id)
      .is("deleted_at", null) // 論理削除されていないもののみ
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to export tools:", error);
      return {
        success: false,
        error: "データの取得に失敗しました",
      };
    }

    return {
      success: true,
      data: {
        tools: tools || [],
        exportedAt: new Date().toISOString(),
        totalCount: tools?.length || 0,
      },
    };
  } catch (error) {
    console.error("Export error:", error);
    return {
      success: false,
      error: "エクスポート中にエラーが発生しました",
    };
  }
}

/**
 * インポートデータのバリデーション
 */
function validateImportData(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "無効なデータ形式です" };
  }

  if (!Array.isArray(data.tools)) {
    return { valid: false, error: "tools配列が見つかりません" };
  }

  // 各ツールの必須フィールドをチェック
  const requiredFields = ["tool_name", "category", "usage_purpose", "user_experience", "rating"];

  for (let i = 0; i < data.tools.length; i++) {
    const tool = data.tools[i];

    for (const field of requiredFields) {
      if (!tool[field]) {
        return {
          valid: false,
          error: `ツール ${i + 1}: ${field} が必須です`,
        };
      }
    }

    // rating は 1-5 の範囲
    if (tool.rating < 1 || tool.rating > 5) {
      return {
        valid: false,
        error: `ツール ${i + 1}: rating は 1-5 の範囲である必要があります`,
      };
    }
  }

  return { valid: true };
}

/**
 * JSONデータをインポートしてAIツールを一括登録する
 *
 * Requirements: 10.3, 10.4, 10.5
 */
export async function importToolsDataAction(
  jsonData: string
): Promise<ImportDataResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "認証が必要です",
      };
    }

    // JSONパース
    let parsedData;
    try {
      parsedData = JSON.parse(jsonData);
    } catch (e) {
      return {
        success: false,
        error: "JSON形式が無効です",
      };
    }

    // バリデーション
    const validation = validateImportData(parsedData);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const tools = parsedData.tools as Partial<AITool>[];
    const errors: string[] = [];
    let importedCount = 0;
    let skippedCount = 0;

    // 各ツールをインポート
    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];

      try {
        // 既存データをクリーンアップ（id, created_at, updated_atなど）
        const cleanTool = {
          tool_name: tool.tool_name,
          category: tool.category,
          usage_purpose: tool.usage_purpose,
          user_experience: tool.user_experience,
          rating: tool.rating,
          usage_date: tool.usage_date || new Date().toISOString(),
          official_url: tool.official_url || null,
          created_by: session.user.id, // 現在のユーザーIDで上書き
        };

        const { error } = await supabase
          .from("ai_tools")
          .insert(cleanTool);

        if (error) {
          errors.push(`ツール ${i + 1} (${tool.tool_name}): ${error.message}`);
          skippedCount++;
        } else {
          importedCount++;
        }
      } catch (error) {
        errors.push(`ツール ${i + 1} (${tool.tool_name}): 予期しないエラー`);
        skippedCount++;
      }
    }

    return {
      success: true,
      data: {
        importedCount,
        skippedCount,
        errors,
      },
    };
  } catch (error) {
    console.error("Import error:", error);
    return {
      success: false,
      error: "インポート中にエラーが発生しました",
    };
  }
}
