import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PromptHistory } from "@/lib/schemas/prompt.schema";

interface PromptHistoryCardProps {
  history: PromptHistory;
  userName: string;
}

export function PromptHistoryCard({ history, userName }: PromptHistoryCardProps) {
  const createdAt = new Date(history.created_at);
  const relativeTime = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: ja,
  });

  // プロンプトテキストを最初の150文字でプレビュー
  const preview = history.generated_prompt.length > 150
    ? history.generated_prompt.slice(0, 150) + "..."
    : history.generated_prompt;

  // タイトルの省略表示判定
  const title = history.input_params?.purpose || "Sora2プロンプト";
  const isTitleTruncated = title.length > 50;

  return (
    <Card animated className="flex flex-col h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          {isTitleTruncated ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle className="text-base sm:text-lg line-clamp-2 cursor-help">
                    {title}
                  </CardTitle>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <CardTitle className="text-base sm:text-lg line-clamp-2">
              {title}
            </CardTitle>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <span className="truncate">{userName}</span>
          <span className="hidden sm:inline">•</span>
          <time dateTime={createdAt.toISOString()} className="shrink-0">
            {relativeTime}
          </time>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-between">
        <p className="mb-4 text-xs sm:text-sm text-muted-foreground line-clamp-3 break-words">
          {preview}
        </p>
        <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
          <Link href={`/history/${history.id}`}>詳細を見る</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
