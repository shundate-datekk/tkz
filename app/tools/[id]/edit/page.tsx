import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { aiToolService } from "@/lib/services/ai-tool.service";
import { ToolEditForm } from "@/components/tools/tool-edit-form";
import { Navbar } from "@/components/layout/navbar";

interface ToolEditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ToolEditPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await aiToolService.getTool(id);

  if (!result.success) {
    return {
      title: "ツールが見つかりません",
    };
  }

  return {
    title: `${result.data.tool_name}を編集 | AI Tools & Sora Prompt Generator`,
    description: "AIツール情報を編集",
  };
}

export default async function ToolEditPage({ params }: ToolEditPageProps) {
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

  // 所有者かどうかをチェック
  const isOwner = tool.created_by === session.user.id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={session.user.name ?? undefined} />

      {/* Main Content */}
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AIツール編集</h1>
          <p className="mt-2 text-muted-foreground">
            ツール情報を更新してください
          </p>
        </div>

        <ToolEditForm tool={tool} isOwner={isOwner} />
      </div>
    </div>
  );
}
