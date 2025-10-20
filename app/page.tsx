import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">
            AI Tools & Sora Prompt Generator
          </h1>
          {session?.user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user.name}
              </span>
              <LogoutButton />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center p-24">
        <div className="text-center">
          <h2 className="text-4xl font-bold">
            AI Tools & Sora Prompt Generator
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            AIツール情報共有とSora2プロンプト自動生成アプリ
          </p>

          {session?.user ? (
            <div className="mt-8 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                ようこそ、{session.user.name}さん
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/tools">AIツール一覧</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/tools/new">新規登録</Link>
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button asChild variant="outline">
                    <Link href="/prompt">プロンプト生成</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/history">履歴</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/login">ログイン</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
