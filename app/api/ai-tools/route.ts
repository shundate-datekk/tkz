import { NextRequest, NextResponse } from "next/server";
import { aiToolRepository } from "@/lib/repositories/ai-tool-repository";
import type { AIToolFilter, AIToolSortBy, SortOrder } from "@/lib/schemas/ai-tool.schema";

/**
 * GET /api/ai-tools
 * AIツール一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // フィルタ条件を構築
    const filter: AIToolFilter = {};
    const category = searchParams.get("category");
    const rating = searchParams.get("rating");
    const created_by = searchParams.get("created_by");
    const search = searchParams.get("search");

    if (category) filter.category = category;
    if (rating) filter.rating = parseInt(rating, 10);
    if (created_by) filter.created_by = created_by;
    if (search) filter.search = search;

    // ソート条件
    const sortBy = (searchParams.get("sortBy") as AIToolSortBy) || "usage_date";
    const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "desc";

    const tools = await aiToolRepository.findAll(filter, sortBy, sortOrder);

    return NextResponse.json({
      success: true,
      data: tools,
    });
  } catch (error) {
    console.error("Failed to fetch AI tools:", error);
    return NextResponse.json(
      {
        success: false,
        error: "AIツールの取得に失敗しました",
      },
      { status: 500 }
    );
  }
}
