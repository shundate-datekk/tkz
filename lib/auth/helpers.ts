import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * 現在のセッションを取得
 * 認証されていない場合はnullを返す
 */
export async function getSession() {
  return await auth();
}

/**
 * 現在のユーザーを取得
 * 認証されていない場合はnullを返す
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * 認証が必要なページ/Server Action用のヘルパー
 * 認証されていない場合はログインページにリダイレクト
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

/**
 * 現在のユーザーIDを取得
 * 認証されていない場合はログインページにリダイレクト
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await requireAuth();

  if (!user.id) {
    console.error("User ID is missing from session:", user);
    throw new Error("ユーザーIDが取得できませんでした。再度ログインしてください。");
  }

  return user.id;
}

/**
 * ユーザーが特定のリソースの所有者かチェック
 */
export async function isOwner(resourceOwnerId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.id === resourceOwnerId;
}
