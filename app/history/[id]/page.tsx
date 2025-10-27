import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { promptHistoryService } from "@/lib/services/prompt-history.service";
import { userRepository } from "@/lib/repositories/user-repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { PromptHistoryDeleteButton } from "@/components/prompt/prompt-history-delete-button";
import { PromptHistoryCopyButton } from "@/components/prompt/prompt-history-copy-button";

interface HistoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: HistoryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await promptHistoryService.getPromptHistory(id);

  if (!result.success) {
    return {
      title: "履歴が見つかりません",
    };
  }

  return {
    title: `プロンプト履歴 | AI Tools & Sora Prompt Generator`,
    description: "プロンプト履歴の詳細",
  };
}

export default async function HistoryDetailPage({
  params,
}: HistoryDetailPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const historyResult = await promptHistoryService.getPromptHistory(id);

  if (!historyResult.success) {
    notFound();
  }

  const history = historyResult.data;

  // 作成者情報を取得
  const creator = await userRepository.findById(history.user_id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={session.user.name ?? undefined} />

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/history">← 履歴一覧に戻る</Link>
          </Button>
          <PromptHistoryDeleteButton historyId={history.id} />
        </div>

        {/* プロンプト表示 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>生成されたプロンプト</CardTitle>
              <PromptHistoryCopyButton promptText={history.generated_prompt} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {history.generated_prompt}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 入力パラメータ */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>入力パラメータ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {history.input_params?.purpose && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">目的</h3>
                <p className="text-sm text-muted-foreground">
                  {history.input_params.purpose}
                </p>
              </div>
            )}

            {history.input_params?.sceneDescription && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">シーン説明</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {history.input_params.sceneDescription}
                </p>
              </div>
            )}

            {history.input_params?.style && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">スタイル</h3>
                <p className="text-sm text-muted-foreground">
                  {history.input_params.style}
                </p>
              </div>
            )}

            {history.input_params?.duration && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">長さ</h3>
                <p className="text-sm text-muted-foreground">
                  {history.input_params.duration}
                </p>
              </div>
            )}

            {history.input_params?.additionalRequirements && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">その他の要望</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {history.input_params.additionalRequirements}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* メタ情報 */}
        <Card>
          <CardHeader>
            <CardTitle>情報</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold text-muted-foreground">
                  作成者
                </dt>
                <dd className="mt-1">{creator?.display_name || "不明"}</dd>
              </div>

              <div>
                <dt className="text-sm font-semibold text-muted-foreground">
                  作成日時
                </dt>
                <dd className="mt-1">
                  {new Date(history.created_at).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
