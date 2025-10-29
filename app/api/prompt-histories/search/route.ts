import { NextRequest, NextResponse } from "next/server";
import { promptHistoryService } from "@/lib/services/prompt-history.service";

/**
 * GET /api/prompt-histories/search
 * プロンプト履歴を検索
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const keyword = searchParams.get("keyword");
    if (!keyword) {
      return NextResponse.json(
        {
          success: false,
          error: "検索キーワードが必要です",
        },
        { status: 400 }
      );
    }

    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : undefined;
    const userId = searchParams.get("userId") || undefined;

    const result = await promptHistoryService.searchPromptHistories(keyword, {
      limit,
      offset,
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Failed to search prompt histories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "プロンプト履歴の検索に失敗しました",
      },
      { status: 500 }
    );
  }
}
