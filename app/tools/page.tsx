import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { aiToolService } from "@/lib/services/ai-tool.service";
import { userRepository } from "@/lib/repositories/user-repository";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Navbar } from "@/components/layout/navbar";
import { ToolsList } from "@/components/tools/tools-list";

export const metadata: Metadata = {
  title: "AIツール一覧 | AI Tools & Sora Prompt Generator",
  description: "登録されたAIツールの一覧",
};

export default async function ToolsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // AIツール一覧を取得（使用日の新しい順）
  const toolsResult = await aiToolService.getAllTools(
    undefined,
    "usage_date",
    "desc"
  );

  if (!toolsResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          エラー: {toolsResult.error.message}
        </div>
      </div>
    );
  }

  const tools = toolsResult.data;

  // ユーザー情報を取得してマッピング
  const users = await userRepository.findAll();
  const userMap = new Map(users.map((u) => [u.id, u.display_name]));

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={session.user.name ?? undefined} />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'ホーム', href: '/' },
            { label: 'AIツール一覧' },
          ]}
          className="mb-4"
        />

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AIツール一覧</h1>
          </div>
          <Button asChild>
            <Link href="/tools/new">新規登録</Link>
          </Button>
        </div>

        <ToolsList
          tools={tools}
          userMap={userMap}
          currentUserId={session.user.id}
        />
      </main>
    </div>
  );
}
