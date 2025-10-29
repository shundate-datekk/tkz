"use client";

/**
 * お気に入りプロンプト一覧コンポーネント
 * Requirement 13.8: お気に入りに追加したプロンプトをマイページの「お気に入りプロンプト」セクションに表示する
 */

import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptHistoryCard } from "@/components/prompt/prompt-history-card";
import type { FavoritePromptWithHistory } from "@/lib/types/favorite-prompt.types";

interface FavoritePromptListProps {
  favorites: FavoritePromptWithHistory[];
  currentUserId: string;
}

export function FavoritePromptList({
  favorites,
  currentUserId,
}: FavoritePromptListProps) {
  if (favorites.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="mb-4 text-muted-foreground">
          まだお気に入りのプロンプトが保存されていません
        </p>
        <Button asChild>
          <Link href="/history">プロンプト履歴を見る</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 件数表示 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          お気に入り: {favorites.length}件
        </p>
      </div>

      {/* お気に入り一覧 */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((favorite) => (
          <PromptHistoryCard
            key={favorite.id}
            history={favorite.prompt_history}
            userName="あなた"
            userId={currentUserId}
            isFavorited={true}
          />
        ))}
      </div>
    </div>
  );
}
