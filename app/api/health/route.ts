import { NextResponse } from "next/server";
import { testSupabaseConnection } from "@/lib/supabase/client";
import { validateEnv } from "@/lib/env";

/**
 * ヘルスチェックエンドポイント
 * アプリケーションの状態を確認
 */
export async function GET() {
  try {
    // 環境変数のチェック
    const envValidation = validateEnv();

    if (!envValidation.valid) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required environment variables",
          missing: envValidation.missing,
        },
        { status: 500 }
      );
    }

    // Supabase接続のテスト
    const supabaseTest = await testSupabaseConnection();

    return NextResponse.json({
      status: supabaseTest.success ? "ok" : "error",
      timestamp: new Date().toISOString(),
      checks: {
        environment: {
          status: "ok",
          message: "All environment variables are set",
        },
        database: {
          status: supabaseTest.success ? "ok" : "error",
          message: supabaseTest.message,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
