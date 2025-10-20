import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { promptHistoryService } from "@/lib/services/prompt-history.service";
import { userRepository } from "@/lib/repositories/user-repository";
import { Navbar } from "@/components/layout/navbar";
import { PromptHistoryList } from "@/components/prompt/prompt-history-list";

export const metadata: Metadata = {
  title: "プロンプト履歴 | AI Tools & Sora Prompt Generator",
  description: "生成したプロンプトの履歴",
};

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // プロンプト履歴を取得（生成日時の新しい順）
  const historiesResult = await promptHistoryService.getAllPromptHistories({
    orderBy: "created_at",
    order: "desc",
    limit: 50,
  });

  if (!historiesResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          エラー: {historiesResult.error.message}
        </div>
      </div>
    );
  }

  const histories = historiesResult.data;

  // ユーザー情報を取得してマッピング
  const users = await userRepository.findAll();
  const userMap = new Map(users.map((u) => [u.id, u.display_name]));

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={session.user.name ?? undefined} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">プロンプト履歴</h1>
        </div>

        <PromptHistoryList histories={histories} userMap={userMap} />
      </div>
    </div>
  );
}
