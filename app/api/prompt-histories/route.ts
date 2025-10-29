import { NextRequest, NextResponse } from "next/server";
import { promptHistoryService } from "@/lib/services/prompt-history.service";

/**
 * GET /api/prompt-histories
 * プロンプト履歴一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 50;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : undefined;
    const orderBy = (searchParams.get("orderBy") as "created_at" | "updated_at") || "created_at";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";
    const userId = searchParams.get("userId") || undefined;

    const result = await promptHistoryService.getAllPromptHistories({
      limit,
      offset,
      orderBy,
      order,
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
    console.error("Failed to fetch prompt histories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "プロンプト履歴の取得に失敗しました",
      },
      { status: 500 }
    );
  }
}
