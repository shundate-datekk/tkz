"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

/**
 * ログイン処理
 * NextAuth.js v5（Auth.js）の推奨方法で実装
 */
export async function login(formData: FormData) {
  console.log('[LOGIN ACTION] Starting login process...');

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  console.log('[LOGIN ACTION] Credentials received:', {
    username,
    passwordLength: password?.length,
    hasUsername: !!username,
    hasPassword: !!password
  });

  if (!username || !password) {
    console.log('[LOGIN ACTION] Missing credentials');
    return {
      error: "ユーザー名とパスワードを入力してください",
    };
  }

  try {
    console.log('[LOGIN ACTION] Calling signIn with FormData...');

    // NextAuth.js v5では、signInにFormDataを直接渡すことができる
    // 認証成功時は自動的にリダイレクトされる（例外がスローされない）
    // 認証失敗時はAuthErrorがスローされる
    await signIn("credentials", formData);

    console.log('[LOGIN ACTION] signIn succeeded (this should not be reached if redirected)');
  } catch (error) {
    console.error('[LOGIN ACTION] Error caught:', error);
    console.error('[LOGIN ACTION] Error type:', error?.constructor?.name);
    console.error('[LOGIN ACTION] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof AuthError) {
      console.log('[LOGIN ACTION] AuthError type:', error.type);
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "ユーザー名またはパスワードが正しくありません" };
        default:
          return { error: "ログインに失敗しました" };
      }
    }

    // AuthError以外の例外は再スロー
    throw error;
  }
}

/**
 * ログアウト処理
 */
export async function logout() {
  await signOut({ redirect: true, redirectTo: "/login" });
}
