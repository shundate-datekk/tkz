import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FavoritePromptRepository } from "@/lib/repositories/favorite-prompt.repository";
import { Navbar } from "@/components/layout/navbar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FavoritePromptList } from "@/components/prompt/favorite-prompt-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "マイページ | AI Tools & Sora Prompt Generator",
  description: "お気に入りプロンプトとユーザー情報",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // お気に入りプロンプトを取得
  const favoriteRepository = new FavoritePromptRepository();
  const favoritesResult = await favoriteRepository.findByUserId(
    session.user.id!,
  );

  if (!favoritesResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          エラー: {String(favoritesResult.error)}
        </div>
      </div>
    );
  }

  const favorites = favoritesResult.data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar userName={session.user.name ?? undefined} />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "マイページ" },
          ]}
          className="mb-4"
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold">マイページ</h1>
          <p className="mt-2 text-muted-foreground">
            お気に入りプロンプトとユーザー情報
          </p>
        </div>

        <div className="space-y-8">
          {/* ユーザー情報 */}
          <Card>
            <CardHeader>
              <CardTitle>ユーザー情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">名前</p>
                <p className="font-medium">{session.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">メールアドレス</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* お気に入りプロンプト */}
          <div>
            <h2 className="text-2xl font-bold mb-4">お気に入りプロンプト</h2>
            <FavoritePromptList
              favorites={favorites}
              currentUserId={session.user.id!}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
