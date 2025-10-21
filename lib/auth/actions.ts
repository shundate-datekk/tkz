"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

/**
 * ログイン処理
 * Next.js 15 + React 19のuseFormStateと互換性のある形式
 */
export async function login(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
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
    // 認証成功時は自動的にリダイレクトされる（REDIRECT errorがスローされる）
    // 認証失敗時はAuthErrorがスローされる
    await signIn("credentials", formData);

    console.log('[LOGIN ACTION] signIn succeeded (this line should not be reached)');
    return {};
  } catch (error) {
    console.error('[LOGIN ACTION] Error caught:', error);
    console.error('[LOGIN ACTION] Error type:', error?.constructor?.name);
    console.error('[LOGIN ACTION] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Next.js 15では、リダイレクトはREDIRECT errorとしてスローされる
    // これは正常な動作なので、再スローする
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      console.log('[LOGIN ACTION] Redirect detected (login successful)');
      throw error;
    }

    if (error instanceof AuthError) {
      console.log('[LOGIN ACTION] AuthError type:', error.type);
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "ユーザー名またはパスワードが正しくありません" };
        default:
          return { error: "ログインに失敗しました" };
      }
    }

    // その他のエラーは再スロー
    throw error;
  }
}

/**
 * ログアウト処理
 */
export async function logout() {
  await signOut({ redirect: true, redirectTo: "/login" });
}
