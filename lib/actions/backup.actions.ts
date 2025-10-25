"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase/client";

/**
 * バックアップデータの型定義
 */
export interface Backup {
  id: string;
  user_id: string;
  storage_url: string;
  file_size: number;
  tool_count: number;
  prompt_count: number;
  created_at: string;
}

/**
 * バックアップ作成のレスポンス型
 */
interface CreateBackupResponse {
  success: boolean;
  data?: {
    id: string;
    toolCount: number;
    promptCount: number;
    storageUrl: string;
    createdAt: string;
  };
  error?: string;
}

/**
 * バックアップリストのレスポンス型
 */
interface ListBackupsResponse {
  success: boolean;
  data?: Backup[];
  error?: string;
}

/**
 * バックアップ復元のレスポンス型
 */
interface RestoreBackupResponse {
  success: boolean;
  data?: {
    restoredToolCount: number;
    restoredPromptCount: number;
  };
  error?: string;
}

/**
 * 新しいバックアップを作成する
 * 全AIツールとプロンプト履歴をSupabase Storageに保存し、メタデータをDBに記録
 *
 * Requirements: 10.6, 10.7
 */
export async function createBackupAction(): Promise<CreateBackupResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "認証が必要です",
      };
    }

    // 1. ユーザーのすべてのツールを取得
    const { data: tools, error: toolsError } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("created_by", session.user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (toolsError) {
      console.error("Failed to fetch tools for backup:", toolsError);
      return {
        success: false,
        error: "ツールデータの取得に失敗しました",
      };
    }

    // 2. ユーザーのすべてのプロンプト履歴を取得
    const { data: prompts, error: promptsError } = await supabase
      .from("prompt_history")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (promptsError) {
      console.error("Failed to fetch prompts for backup:", promptsError);
      return {
        success: false,
        error: "プロンプト履歴の取得に失敗しました",
      };
    }

    // 3. バックアップデータを作成
    const backupData = {
      tools: tools || [],
      prompts: prompts || [],
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    const jsonData = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const fileSize = blob.size;

    // 4. Supabase Storageにアップロード
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup-${session.user.id}-${timestamp}.json`;
    const filePath = `backups/${session.user.id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-backups")
      .upload(filePath, blob, {
        contentType: "application/json",
        upsert: false,
      });

    if (uploadError) {
      console.error("Failed to upload backup to storage:", uploadError);
      return {
        success: false,
        error: "バックアップファイルのアップロードに失敗しました",
      };
    }

    // 5. Storage URLを取得
    const { data: urlData } = supabase.storage
      .from("user-backups")
      .getPublicUrl(filePath);

    // 6. バックアップメタデータをDBに保存
    const { data: backupRecord, error: dbError } = await (supabase
      .from("backups") as any)
      .insert({
        user_id: session.user.id,
        storage_url: urlData.publicUrl,
        file_size: fileSize,
        tool_count: tools?.length || 0,
        prompt_count: prompts?.length || 0,
      })
      .select()
      .single() as { data: Backup | null; error: any };

    if (dbError || !backupRecord) {
      console.error("Failed to save backup metadata:", dbError);
      // Storage のファイルを削除（ロールバック）
      await supabase.storage.from("user-backups").remove([filePath]);
      return {
        success: false,
        error: "バックアップメタデータの保存に失敗しました",
      };
    }

    return {
      success: true,
      data: {
        id: backupRecord.id,
        toolCount: backupRecord.tool_count,
        promptCount: backupRecord.prompt_count,
        storageUrl: backupRecord.storage_url,
        createdAt: backupRecord.created_at,
      },
    };
  } catch (error) {
    console.error("Backup creation error:", error);
    return {
      success: false,
      error: "バックアップ作成中にエラーが発生しました",
    };
  }
}

/**
 * ユーザーのバックアップ一覧を取得する
 *
 * Requirements: 10.8
 */
export async function listBackupsAction(): Promise<ListBackupsResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "認証が必要です",
      };
    }

    const { data: backups, error } = await supabase
      .from("backups")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch backups:", error);
      return {
        success: false,
        error: "バックアップ一覧の取得に失敗しました",
      };
    }

    return {
      success: true,
      data: backups || [],
    };
  } catch (error) {
    console.error("List backups error:", error);
    return {
      success: false,
      error: "バックアップ一覧取得中にエラーが発生しました",
    };
  }
}

/**
 * バックアップからデータを復元する
 *
 * Requirements: 10.8
 */
export async function restoreBackupAction(
  backupId: string
): Promise<RestoreBackupResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "認証が必要です",
      };
    }

    // 1. バックアップメタデータを取得
    const { data: backup, error: fetchError } = await supabase
      .from("backups")
      .select("*")
      .eq("id", backupId)
      .single() as { data: Backup | null; error: any };

    if (fetchError || !backup) {
      return {
        success: false,
        error: "バックアップが見つかりません",
      };
    }

    // 2. 権限チェック
    if (backup.user_id !== session.user.id) {
      return {
        success: false,
        error: "このバックアップを復元する権限がありません",
      };
    }

    // 3. Storage からバックアップファイルをダウンロード
    const filePath = new URL(backup.storage_url).pathname.split("/").slice(3).join("/");

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("user-backups")
      .download(filePath);

    if (downloadError || !fileBlob) {
      console.error("Failed to download backup file:", downloadError);
      return {
        success: false,
        error: "バックアップファイルのダウンロードに失敗しました",
      };
    }

    // 4. JSON をパース
    const jsonText = await fileBlob.text();
    const backupData = JSON.parse(jsonText);

    // 5. ツールを復元（既存データは上書きしない、新規追加のみ）
    let restoredToolCount = 0;
    if (Array.isArray(backupData.tools)) {
      for (const tool of backupData.tools) {
        const { error } = await (supabase
          .from("ai_tools") as any)
          .insert({
            tool_name: tool.tool_name,
            category: tool.category,
            usage_purpose: tool.usage_purpose,
            user_experience: tool.user_experience,
            rating: tool.rating,
            usage_date: tool.usage_date || new Date().toISOString(),
            official_url: tool.official_url || null,
            created_by: session.user.id,
          });

        if (!error) {
          restoredToolCount++;
        }
      }
    }

    // 6. プロンプト履歴を復元
    let restoredPromptCount = 0;
    if (Array.isArray(backupData.prompts)) {
      for (const prompt of backupData.prompts) {
        const { error } = await (supabase
          .from("prompt_history") as any)
          .insert({
            user_id: session.user.id,
            input_text: prompt.input_text || "",
            generated_prompt: prompt.generated_prompt || "",
            output_language: prompt.output_language || "en",
          });

        if (!error) {
          restoredPromptCount++;
        }
      }
    }

    return {
      success: true,
      data: {
        restoredToolCount,
        restoredPromptCount,
      },
    };
  } catch (error) {
    console.error("Restore backup error:", error);
    return {
      success: false,
      error: "バックアップ復元中にエラーが発生しました",
    };
  }
}
