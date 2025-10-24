import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ToolCreateForm } from "@/components/tools/tool-create-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "新規ツール登録 | AI Tools & Sora Prompt Generator",
  description: "新しいAIツールを登録",
};

export default async function NewToolPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={session.user.name ?? undefined} />

      {/* Main Content */}
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'ホーム', href: '/' },
            { label: 'AIツール一覧', href: '/tools' },
            { label: '新規登録' },
          ]}
          className="mb-4"
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold">新規AIツール登録</h1>
          <p className="mt-2 text-muted-foreground">
            使用したAIツールの情報を登録してください
          </p>
        </div>

        <ToolCreateForm />
      </div>
    </div>
  );
}
