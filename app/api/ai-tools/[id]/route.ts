import { NextRequest, NextResponse } from "next/server";
import { aiToolRepository } from "@/lib/repositories/ai-tool-repository";

/**
 * GET /api/ai-tools/:id
 * 特定のAIツールを取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tool = await aiToolRepository.findById(id);

    if (!tool) {
      return NextResponse.json(
        {
          success: false,
          error: "AIツールが見つかりませんでした",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tool,
    });
  } catch (error) {
    console.error("Failed to fetch AI tool:", error);
    return NextResponse.json(
      {
        success: false,
        error: "AIツールの取得に失敗しました",
      },
      { status: 500 }
    );
  }
}
