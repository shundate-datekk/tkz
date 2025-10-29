import { NextRequest, NextResponse } from "next/server";
import { notificationRepository } from "@/lib/repositories/notification-repository";

/**
 * GET /api/notifications/unread
 * 未読通知一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "ユーザーIDが必要です",
        },
        { status: 400 }
      );
    }

    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : 10;

    const result = await notificationRepository.getUnreadNotifications(userId, limit);

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
    console.error("Failed to fetch unread notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "未読通知の取得に失敗しました",
      },
      { status: 500 }
    );
  }
}
