import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { getActivityFeedAction } from "@/lib/actions/activity-feed.actions";
import { Wrench, Plus, Sparkles, History } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  // 活動フィードを取得
  let activities = [];
  if (session?.user) {
    const activitiesResult = await getActivityFeedAction(10);
    if (activitiesResult.success) {
      activities = activitiesResult.data;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar userName={session?.user?.name ?? undefined} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 pb-24 md:pb-16">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold md:text-5xl">
            AI Tools & Sora Prompt Generator
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            AIツール情報共有とSora2プロンプト自動生成アプリ
          </p>

          {session?.user ? (
            <div className="mt-12 w-full max-w-4xl space-y-8">
              <p className="text-sm text-muted-foreground">
                ようこそ、{session.user.name}さん
              </p>

              {/* クイックアクションボタン */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button asChild size="lg" className="w-full">
                  <Link href="/tools">
                    <Wrench className="mr-2 h-5 w-5" />
                    AIツール一覧
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full">
                  <Link href="/tools/new">
                    <Plus className="mr-2 h-5 w-5" />
                    新規登録
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link href="/prompt">
                    <Sparkles className="mr-2 h-5 w-5" />
                    プロンプト生成
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link href="/history">
                    <History className="mr-2 h-5 w-5" />
                    履歴
                  </Link>
                </Button>
              </div>

              {/* 活動フィード */}
              <ActivityFeed activities={activities} />
            </div>
          ) : (
            <div className="mt-12">
              <Button asChild size="lg">
                <Link href="/login">ログイン</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNavigation />
    </div>
  );
}
