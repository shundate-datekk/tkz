import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Supabase接続をテストする関数
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { error } = await supabase.from("users").select("count").limit(1);

    if (error) {
      // テーブルが存在しない場合はまだマイグレーションが実行されていないだけなので、接続自体はOK
      if (error.code === "42P01") {
        return {
          success: true,
          message:
            "Supabase接続成功（テーブルはまだ作成されていません）",
        };
      }
      throw error;
    }

    return {
      success: true,
      message: "Supabase接続成功",
    };
  } catch (error) {
    return {
      success: false,
      message: `Supabase接続失敗: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
