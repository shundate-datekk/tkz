"use client";

/**
 * お気に入りボタンコンポーネント
 * Requirement 13.7: プロンプト詳細画面に「お気に入り」スターアイコンを提供する
 */

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  addFavoritePromptAction,
  removeFavoritePromptAction,
} from "@/lib/actions/favorite-prompt.actions";

interface FavoriteButtonProps {
  userId: string;
  promptHistoryId: string;
  initialIsFavorited: boolean;
  size?: "sm" | "md" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline";
  showLabel?: boolean;
}

export function FavoriteButton({
  userId,
  promptHistoryId,
  initialIsFavorited,
  size = "icon",
  variant = "ghost",
  showLabel = false,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        if (isFavorited) {
          // お気に入りから削除
          const result = await removeFavoritePromptAction(
            userId,
            promptHistoryId,
          );

          if (!result.success) {
            toast.error("お気に入りから削除できませんでした", {
              description: result.error.message,
            });
            return;
          }

          setIsFavorited(false);
          toast.success("お気に入りから削除しました");
        } else {
          // お気に入りに追加
          const result = await addFavoritePromptAction(userId, promptHistoryId);

          if (!result.success) {
            toast.error("お気に入りに追加できませんでした", {
              description: result.error.message,
            });
            return;
          }

          setIsFavorited(true);
          toast.success("お気に入りに追加しました");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "予期しないエラーが発生しました";
        toast.error("エラーが発生しました", {
          description: message,
        });
      }
    });
  };

  const tooltipText = isFavorited
    ? "お気に入りから削除"
    : "お気に入りに追加";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleToggle}
            disabled={isPending}
            className="group"
            aria-label={tooltipText}
          >
            <Star
              className={`h-4 w-4 transition-all ${
                isFavorited
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground group-hover:text-yellow-400"
              } ${isPending ? "opacity-50" : ""}`}
            />
            {showLabel && (
              <span className="ml-2">
                {isFavorited ? "お気に入り済み" : "お気に入り"}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
