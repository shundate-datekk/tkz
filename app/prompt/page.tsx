import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Navbar } from "@/components/layout/navbar";
import { PromptGenerator } from "@/components/prompt/prompt-generator";

export const metadata: Metadata = {
  title: "Sora2プロンプト生成 | AI Tools & Sora Prompt Generator",
  description: "Sora2用の動画プロンプトを生成",
};

export default async function PromptPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={session.user.name ?? undefined} />

      {/* Main Content */}
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Sora2プロンプト生成</h1>
          <p className="mt-2 text-muted-foreground">
            動画の内容を入力すると、Sora2用の英語プロンプトを自動生成します
          </p>
        </div>

        <PromptGenerator />
      </div>
    </div>
  );
}
