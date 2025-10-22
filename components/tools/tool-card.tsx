import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/tools/like-button";
import { likeToolAction, unlikeToolAction } from "@/lib/actions/like.actions";
import type { AITool } from "@/lib/schemas/ai-tool.schema";

interface ToolCardProps {
  tool: AITool;
  userName: string;
  currentUserId: string;
  likeCount?: number;
  userHasLiked?: boolean;
}

export function ToolCard({ 
  tool, 
  userName, 
  currentUserId,
  likeCount = 0,
  userHasLiked = false,
}: ToolCardProps) {
  const isOwner = tool.created_by === currentUserId;

  // 星評価を表示
  const stars = "⭐".repeat(tool.rating);

  // 使用日を相対時間で表示
  const usageDate = new Date(tool.usage_date);
  const relativeTime = formatDistanceToNow(usageDate, {
    addSuffix: true,
    locale: ja,
  });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{tool.tool_name}</CardTitle>
            <CardDescription className="mt-1">
              {tool.category}
            </CardDescription>
          </div>
          <div className="text-sm" title={`評価: ${tool.rating}/5`}>
            {stars}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2">
        <div>
          <h4 className="mb-1 text-sm font-semibold text-muted-foreground">
            使用目的
          </h4>
          <p className="line-clamp-2 text-sm">{tool.usage_purpose}</p>
        </div>

        <div>
          <h4 className="mb-1 text-sm font-semibold text-muted-foreground">
            使用感
          </h4>
          <p className="line-clamp-2 text-sm">{tool.user_experience}</p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t pt-4">
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <span>登録者: {userName}</span>
          <span title={usageDate.toLocaleDateString("ja-JP")}>
            {relativeTime}
          </span>
        </div>

        <div className="flex w-full items-center gap-2">
          <LikeButton
            toolId={tool.id}
            initialLikeCount={likeCount}
            initialUserHasLiked={userHasLiked}
          />
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/tools/${tool.id}`}>詳細</Link>
          </Button>
          {isOwner && (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/tools/${tool.id}/edit`}>編集</Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
