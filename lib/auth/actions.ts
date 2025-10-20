"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

/**
 * ログイン処理
 */
export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return {
      error: "ユーザー名とパスワードを入力してください",
    };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "ユーザー名またはパスワードが正しくありません" };
        default:
          return { error: "ログインに失敗しました" };
      }
    }
    throw error;
  }
}

/**
 * ログアウト処理
 */
export async function logout() {
  await signOut({ redirect: true, redirectTo: "/login" });
}
