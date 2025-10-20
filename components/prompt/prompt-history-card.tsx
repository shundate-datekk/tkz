import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  // プロンプトテキストを最初の100文字でプレビュー
  const preview = history.prompt_text.length > 100
    ? history.prompt_text.slice(0, 100) + "..."
    : history.prompt_text;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg line-clamp-2">
            {history.input_parameters?.purpose || "Sora2プロンプト"}
          </CardTitle>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{userName}</span>
          <span>•</span>
          <span>{relativeTime}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
          {preview}
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href={`/history/${history.id}`}>詳細を見る</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
