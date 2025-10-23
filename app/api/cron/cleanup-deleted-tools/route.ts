import { NextResponse } from "next/server";
import { aiToolService } from "@/lib/services/ai-tool.service";

/**
 * Cron job: 30日以上前に削除されたツールを自動クリーンアップ
 *
 * Requirements: 3.2
 *
 * Vercel Cronの設定例（vercel.json）:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-deleted-tools",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Vercel Cronからのリクエストを検証
    const authHeader = request.headers.get("authorization");

    // 本番環境ではCRON_SECRETで認証
    if (process.env.NODE_ENV === "production") {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    // 30日以上前に削除されたツールをクリーンアップ
    const result = await aiToolService.cleanupOldDeletedTools();

    if (!result.success) {
      console.error("Cleanup failed:", result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    console.log(`Cleanup completed: ${result.data.count} tools deleted`);

    return NextResponse.json({
      success: true,
      deletedCount: result.data.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cleanup cron job failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
