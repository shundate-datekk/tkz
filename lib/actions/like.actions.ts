"use server";

import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

/**
 * ツールにいいねする
 */
export async function likeToolAction(toolId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    const supabase = await createClient();

    // 既にいいねしているかチェック
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("tool_id", toolId)
      .eq("user_id", session.user.id)
      .single();

    if (existingLike) {
      return {
        success: false,
        error: "既にいいねしています",
      };
    }

    // いいねを追加
    const { error } = await (supabase as any)
      .from("likes")
      .insert({
        tool_id: toolId,
        user_id: session.user.id,
      });

    if (error) {
      console.error("Failed to like tool:", error);
      return {
        success: false,
        error: "いいねの追加に失敗しました",
      };
    }

    revalidatePath("/tools");
    revalidatePath(`/tools/${toolId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Like tool action error:", error);
    return {
      success: false,
      error: "予期しないエラーが発生しました",
    };
  }
}

/**
 * ツールのいいねを解除する
 */
export async function unlikeToolAction(toolId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("tool_id", toolId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Failed to unlike tool:", error);
      return {
        success: false,
        error: "いいね解除に失敗しました",
      };
    }

    revalidatePath("/tools");
    revalidatePath(`/tools/${toolId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unlike tool action error:", error);
    return {
      success: false,
      error: "予期しないエラーが発生しました",
    };
  }
}

/**
 * ツールのいいね数と現在のユーザーがいいねしているかを取得
 */
export async function getToolLikeStatus(toolId: string) {
  try {
    const session = await auth();
    const supabase = await createClient();

    // いいね数を取得
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("tool_id", toolId);

    const likeCount = count || 0;

    // ユーザーがいいねしているかチェック
    let userHasLiked = false;
    if (session?.user) {
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("tool_id", toolId)
        .eq("user_id", session.user.id)
        .single();

      userHasLiked = !!data;
    }

    return {
      success: true,
      data: {
        tool_id: toolId,
        like_count: likeCount,
        user_has_liked: userHasLiked,
      },
    };
  } catch (error) {
    console.error("Get tool like status error:", error);
    return {
      success: false,
      error: "いいね情報の取得に失敗しました",
      data: {
        tool_id: toolId,
        like_count: 0,
        user_has_liked: false,
      },
    };
  }
}
