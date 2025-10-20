import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { aiToolService } from "@/lib/services/ai-tool.service";
import { userRepository } from "@/lib/repositories/user-repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { ToolDeleteButton } from "@/components/tools/tool-delete-button";

interface ToolDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ToolDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await aiToolService.getTool(id);

  if (!result.success) {
    return {
      title: "ツールが見つかりません",
    };
  }

  return {
    title: `${result.data.tool_name} | AI Tools & Sora Prompt Generator`,
    description: result.data.usage_purpose.slice(0, 160),
  };
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const toolResult = await aiToolService.getTool(id);

  if (!toolResult.success) {
    notFound();
  }

  const tool = toolResult.data;

  // 作成者情報を取得
  const creator = await userRepository.findById(tool.created_by);
  const isOwner = tool.created_by === session.user.id;

  // 星評価
  const stars = "⭐".repeat(tool.rating);

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={session.user.name ?? undefined} />

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/tools">← 一覧に戻る</Link>
          </Button>
          {isOwner && (
            <>
              <Button asChild variant="secondary">
                <Link href={`/tools/${tool.id}/edit`}>編集</Link>
              </Button>
              <ToolDeleteButton
                toolId={tool.id}
                toolName={tool.tool_name}
                isOwner={isOwner}
              />
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-3xl">{tool.tool_name}</CardTitle>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="rounded-full bg-secondary px-3 py-1">
                    {tool.category}
                  </span>
                  <span>{stars}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">使用目的</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {tool.usage_purpose}
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">使用感</h3>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {tool.user_experience}
              </p>
            </div>

            <div className="border-t pt-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-muted-foreground">
                    評価
                  </dt>
                  <dd className="mt-1 text-xl">
                    {stars} ({tool.rating}/5)
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-muted-foreground">
                    使用日
                  </dt>
                  <dd className="mt-1">
                    {new Date(tool.usage_date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-muted-foreground">
                    登録者
                  </dt>
                  <dd className="mt-1">{creator?.display_name || "不明"}</dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-muted-foreground">
                    登録日時
                  </dt>
                  <dd className="mt-1">
                    {new Date(tool.created_at).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
