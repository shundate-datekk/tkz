"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { likeToolAction, unlikeToolAction } from "@/lib/actions/like.actions";
import { toast } from "sonner";

interface LikeButtonProps {
  toolId: string;
  initialLikeCount: number;
  initialUserHasLiked: boolean;
}

/**
 * いいねボタンコンポーネント
 * アニメーション付きでいいね/いいね解除を切り替え
 */
export function LikeButton({
  toolId,
  initialLikeCount,
  initialUserHasLiked,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialUserHasLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  const handleToggleLike = () => {
    startTransition(async () => {
      const previousLiked = liked;
      const previousCount = likeCount;

      try {
        if (liked) {
          // 楽観的UI更新
          setLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
          
          // いいね解除
          const result = await unlikeToolAction(toolId);
          
          if (!result.success) {
            // エラー時は元に戻す
            setLiked(previousLiked);
            setLikeCount(previousCount);
            toast.error("いいね解除に失敗しました");
          }
        } else {
          // 楽観的UI更新
          setLiked(true);
          setLikeCount((prev) => prev + 1);
          
          // いいね
          const result = await likeToolAction(toolId);
          
          if (!result.success) {
            // エラー時は元に戻す
            setLiked(previousLiked);
            setLikeCount(previousCount);
            toast.error("いいねに失敗しました");
          }
        }
      } catch (error) {
        console.error("Failed to toggle like:", error);
        setLiked(previousLiked);
        setLikeCount(previousCount);
        toast.error("予期しないエラーが発生しました");
      }
    });
  };

  return (
    <Button
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={handleToggleLike}
      disabled={isPending}
      className={cn(
        "gap-2 transition-colors",
        liked && "bg-pink-500 hover:bg-pink-600 text-white"
      )}
    >
      <motion.div
        key={liked ? "liked" : "not-liked"}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            liked && "fill-current"
          )}
        />
      </motion.div>
      <span className="text-sm font-medium">{likeCount}</span>
    </Button>
  );
}

/**
 * シンプルないいねカウント表示（ボタンなし）
 */
export function LikeCount({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <Heart className="h-4 w-4" />
      <span>{count}</span>
    </div>
  );
}
